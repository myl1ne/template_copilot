"""
Agent execution engine for running AI agents and managing their lifecycle.
"""
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from models import Agent, AgentStatus, AgentType, ExecutionLog
from database import db_service
from config import settings


class AgentEngine:
    """Engine for executing agents and managing their lifecycle."""
    
    def __init__(self):
        """Initialize the agent engine."""
        self.active_agents: Dict[str, Agent] = {}
    
    async def create_agent(
        self,
        user_id: str,
        name: str,
        prompt: str,
        agent_type: AgentType = AgentType.CUSTOM,
        system_prompt: str = "",
        parent_id: Optional[str] = None,
        computation_budget: Optional[int] = None
    ) -> Agent:
        """Create a new agent."""
        # Validate parent agent if provided
        parent_depth = 0
        if parent_id:
            parent = await db_service.get_agent(parent_id)
            if not parent:
                raise ValueError(f"Parent agent {parent_id} not found")
            
            parent_depth = parent.depth
            if parent_depth >= settings.max_agent_depth:
                raise ValueError(f"Maximum agent depth ({settings.max_agent_depth}) reached")
            
            # Check parent has budget
            if parent.budget_used >= parent.computation_budget:
                raise ValueError("Parent agent has no remaining budget")
        
        # Determine computation budget
        if computation_budget is None:
            if parent_id:
                # Child agent gets a portion of parent's remaining budget
                parent = await db_service.get_agent(parent_id)
                available = parent.computation_budget - parent.budget_used
                computation_budget = min(available // 2, settings.default_computation_budget)
            else:
                computation_budget = settings.default_computation_budget
        
        # Create agent
        agent = Agent(
            id=str(uuid.uuid4()),
            user_id=user_id,
            parent_id=parent_id,
            name=name,
            type=agent_type,
            prompt=prompt,
            system_prompt=system_prompt or self._get_default_system_prompt(agent_type),
            computation_budget=computation_budget,
            depth=parent_depth + 1 if parent_id else 0,
            status=AgentStatus.CREATED
        )
        
        # Save to database
        await db_service.create_agent(agent)
        
        # Log creation
        await self._log_event(
            agent.id,
            "agent_created",
            f"Agent '{name}' created with budget {computation_budget}",
            {"type": agent_type.value, "depth": agent.depth}
        )
        
        return agent
    
    async def start_agent(self, agent_id: str) -> Agent:
        """Start an agent's execution."""
        agent = await db_service.get_agent(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")
        
        if agent.status != AgentStatus.CREATED:
            raise ValueError(f"Agent must be in CREATED status to start")
        
        # Update status
        agent = await db_service.update_agent(agent_id, {"status": AgentStatus.RUNNING})
        self.active_agents[agent_id] = agent
        
        await self._log_event(agent_id, "agent_started", "Agent execution started")
        
        # In a real implementation, this would trigger the LLM processing
        # For now, we'll simulate the agent thinking process
        await self._simulate_agent_thinking(agent)
        
        return agent
    
    async def _simulate_agent_thinking(self, agent: Agent):
        """Simulate agent processing (placeholder for actual LLM integration)."""
        # This is a placeholder that demonstrates the flow
        # In production, this would:
        # 1. Send prompt to LLM
        # 2. Parse response for sub-agent creation requests
        # 3. Manage context and budget
        # 4. Handle parent-child communication
        
        await self._log_event(
            agent.id,
            "processing",
            f"Processing prompt: {agent.prompt[:100]}..."
        )
        
        # Simulate budget usage
        budget_cost = 10  # Placeholder cost
        await self._consume_budget(agent.id, budget_cost)
    
    async def spawn_child_agent(
        self,
        parent_id: str,
        name: str,
        prompt: str,
        agent_type: AgentType = AgentType.CUSTOM
    ) -> Agent:
        """Spawn a child agent from a parent agent."""
        parent = await db_service.get_agent(parent_id)
        if not parent:
            raise ValueError(f"Parent agent {parent_id} not found")
        
        if parent.status != AgentStatus.RUNNING:
            raise ValueError("Parent agent must be running to spawn children")
        
        # Create child agent
        child = await self.create_agent(
            user_id=parent.user_id,
            name=name,
            prompt=prompt,
            agent_type=agent_type,
            parent_id=parent_id
        )
        
        # Update parent's children list
        children = parent.children_ids.copy()
        children.append(child.id)
        await db_service.update_agent(parent_id, {"children_ids": children})
        
        await self._log_event(
            parent_id,
            "child_spawned",
            f"Spawned child agent: {child.name}",
            {"child_id": child.id}
        )
        
        return child
    
    async def _consume_budget(self, agent_id: str, amount: int):
        """Consume computation budget for an agent."""
        agent = await db_service.get_agent(agent_id)
        if not agent:
            return
        
        new_budget_used = agent.budget_used + amount
        if new_budget_used > agent.computation_budget:
            # Budget exceeded, pause agent
            await db_service.update_agent(
                agent_id,
                {
                    "budget_used": agent.computation_budget,
                    "status": AgentStatus.PAUSED
                }
            )
            await self._log_event(
                agent_id,
                "budget_exceeded",
                "Computation budget exceeded, agent paused"
            )
        else:
            await db_service.update_agent(agent_id, {"budget_used": new_budget_used})
    
    async def complete_agent(self, agent_id: str, result: str):
        """Mark an agent as completed with a result."""
        await db_service.update_agent(
            agent_id,
            {
                "status": AgentStatus.COMPLETED,
                "result": result,
                "completed_at": datetime.utcnow()
            }
        )
        
        if agent_id in self.active_agents:
            del self.active_agents[agent_id]
        
        await self._log_event(agent_id, "agent_completed", "Agent execution completed")
        
        # Update user stats
        agent = await db_service.get_agent(agent_id)
        if agent:
            await self._update_user_stats(agent.user_id, agent)
    
    async def _update_user_stats(self, user_id: str, agent: Agent):
        """Update user statistics after agent completion."""
        user = await db_service.get_user(user_id)
        if not user:
            return
        
        # Calculate experience based on agent depth and budget used
        xp_gained = agent.budget_used + (agent.depth * 50)
        
        updates = {
            "agents_completed": user.agents_completed + 1,
            "total_computations": user.total_computations + agent.budget_used,
            "experience": user.experience + xp_gained
        }
        
        # Check for level up
        xp_for_next_level = user.level * 1000
        if updates["experience"] >= xp_for_next_level:
            updates["level"] = user.level + 1
            updates["total_budget"] = user.total_budget + 500
            updates["available_budget"] = user.available_budget + 500
        
        await db_service.update_user(user_id, updates)
    
    async def _log_event(
        self,
        agent_id: str,
        event_type: str,
        message: str,
        data: Dict[str, Any] = None
    ):
        """Log an execution event."""
        log = ExecutionLog(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            event_type=event_type,
            message=message,
            data=data or {}
        )
        await db_service.create_log(log)
    
    def _get_default_system_prompt(self, agent_type: AgentType) -> str:
        """Get default system prompt for an agent type."""
        prompts = {
            AgentType.AUDITOR: "You are an auditing agent. Review and verify the outputs of other agents for accuracy and consistency.",
            AgentType.ETHICAL_COMMITTEE: "You are an ethical review agent. Evaluate decisions and outputs for ethical implications and potential concerns.",
            AgentType.CRITICAL_THINKER: "You are a critical thinking agent. Analyze arguments, identify logical flaws, and challenge assumptions.",
            AgentType.RESEARCHER: "You are a research agent. Gather information, synthesize findings, and provide comprehensive analysis.",
            AgentType.SUMMARIZER: "You are a summarization agent. Condense complex information into clear, concise summaries.",
            AgentType.VALIDATOR: "You are a validation agent. Check outputs against requirements and verify correctness.",
            AgentType.CUSTOM: "You are a general-purpose AI agent. Follow the user's instructions carefully."
        }
        return prompts.get(agent_type, prompts[AgentType.CUSTOM])


# Global engine instance
agent_engine = AgentEngine()
