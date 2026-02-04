"""
Interactive Streamlit App for Conversation Embedding Visualization
"""

import streamlit as st
import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from embeddings_space.core.conversation import Conversation, ConversationManager
from embeddings_space.core.embeddings import EmbeddingSpace
from embeddings_space.audit.llm_evaluator import LLMEvaluator, EvaluationMetrics
from embeddings_space.visualizers.interactive_viz import InteractiveEmbeddingVisualizer
from embeddings_space.utils.importers import import_conversations


# Page configuration
st.set_page_config(
    page_title="EmbeddingsSpace Explorer",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if 'conversations' not in st.session_state:
    st.session_state.conversations = []
if 'conversation_manager' not in st.session_state:
    st.session_state.conversation_manager = ConversationManager()
if 'embedding_space' not in st.session_state:
    st.session_state.embedding_space = EmbeddingSpace()
if 'evaluator' not in st.session_state:
    st.session_state.evaluator = LLMEvaluator()
if 'embeddings_computed' not in st.session_state:
    st.session_state.embeddings_computed = False


def load_sample_data():
    """Load sample conversations for demo"""
    sample_convs = []
    
    topics = [
        ("Quantum Computing", "Explain quantum computing", "Quantum computing uses quantum mechanics..."),
        ("Python Programming", "How do I learn Python?", "Start with the basics: variables, loops..."),
        ("Climate Change", "What causes climate change?", "Climate change is primarily caused by..."),
        ("AI Ethics", "What are the ethical concerns with AI?", "AI ethics involves considerations like..."),
        ("Space Exploration", "Tell me about Mars missions", "Mars exploration has progressed significantly..."),
    ]
    
    for i, (title, user_msg, assistant_msg) in enumerate(topics):
        conv = Conversation(conversation_id=f"sample_{i}")
        conv.metadata['title'] = title
        conv.add_message("user", user_msg)
        conv.add_message("assistant", assistant_msg)
        sample_convs.append(conv)
    
    return sample_convs


def main():
    # Title and description
    st.title("🗺️ EmbeddingsSpace Explorer")
    st.markdown("""
    Interactive platform for visualizing and exploring conversation embeddings.
    Upload your ChatGPT conversations or use sample data to get started.
    """)
    
    # Sidebar
    with st.sidebar:
        st.header("📊 Data Management")
        
        # File upload
        st.subheader("Import Conversations")
        uploaded_file = st.file_uploader(
            "Upload ChatGPT Export (JSON or ZIP)",
            type=['json', 'zip'],
            help="Export your ChatGPT conversations and upload them here"
        )
        
        if uploaded_file is not None:
            if st.button("Load Uploaded File"):
                with st.spinner("Loading conversations..."):
                    try:
                        # Save uploaded file temporarily
                        temp_path = f"/tmp/{uploaded_file.name}"
                        with open(temp_path, 'wb') as f:
                            f.write(uploaded_file.getbuffer())
                        
                        # Import conversations
                        conversations = import_conversations(temp_path, format='chatgpt')
                        st.session_state.conversations = conversations
                        st.session_state.conversation_manager = ConversationManager()
                        for conv in conversations:
                            st.session_state.conversation_manager.add_conversation(conv)
                        st.session_state.embeddings_computed = False
                        
                        st.success(f"✅ Loaded {len(conversations)} conversations!")
                        
                        # Clean up
                        os.remove(temp_path)
                    except Exception as e:
                        st.error(f"Error loading file: {e}")
        
        # Load sample data
        if st.button("Load Sample Data"):
            with st.spinner("Loading sample conversations..."):
                conversations = load_sample_data()
                st.session_state.conversations = conversations
                st.session_state.conversation_manager = ConversationManager()
                for conv in conversations:
                    st.session_state.conversation_manager.add_conversation(conv)
                st.session_state.embeddings_computed = False
                st.success(f"✅ Loaded {len(conversations)} sample conversations!")
        
        # Display loaded data info
        if st.session_state.conversations:
            st.divider()
            st.metric("Total Conversations", len(st.session_state.conversations))
            total_messages = sum(len(c.messages) for c in st.session_state.conversations)
            st.metric("Total Messages", total_messages)
        
        # Processing section
        if st.session_state.conversations:
            st.divider()
            st.subheader("⚙️ Processing")
            
            # Compute embeddings
            if not st.session_state.embeddings_computed:
                if st.button("Compute Embeddings"):
                    with st.spinner("Computing embeddings..."):
                        progress_bar = st.progress(0)
                        for i, conv in enumerate(st.session_state.conversations):
                            st.session_state.embedding_space.embed_conversation(conv)
                            progress_bar.progress((i + 1) / len(st.session_state.conversations))
                        st.session_state.embeddings_computed = True
                        st.success("✅ Embeddings computed!")
                        st.rerun()
            else:
                st.success("✅ Embeddings ready")
            
            # Evaluate conversations
            if st.session_state.embeddings_computed:
                if st.button("Evaluate with LLM"):
                    with st.spinner("Evaluating conversations (using mock mode)..."):
                        progress_bar = st.progress(0)
                        metrics = [
                            EvaluationMetrics.COHERENCE,
                            EvaluationMetrics.RELEVANCE,
                            EvaluationMetrics.CREATIVITY,
                            EvaluationMetrics.HELPFULNESS,
                            EvaluationMetrics.ENGAGEMENT,
                        ]
                        for i, conv in enumerate(st.session_state.conversations):
                            for metric in metrics:
                                st.session_state.evaluator.evaluate_conversation(
                                    conv, metric, use_mock=True
                                )
                            progress_bar.progress((i + 1) / len(st.session_state.conversations))
                        st.success("✅ Evaluation complete!")
                        st.rerun()
    
    # Main content area
    if not st.session_state.conversations:
        st.info("👈 Start by loading conversations from the sidebar")
        
        # Show instructions
        st.markdown("""
        ### Getting Started
        
        1. **Upload ChatGPT Conversations**: Export your ChatGPT data and upload the JSON file
        2. **Or Load Sample Data**: Use the sample data to try out the platform
        3. **Compute Embeddings**: Generate vector embeddings for each conversation
        4. **Explore**: Browse conversations and visualize the embedding space
        
        ### Features
        
        - 🔍 **Search & Browse**: Find conversations by content or metadata
        - 📊 **Interactive Visualizations**: Explore embeddings in 2D/3D space
        - 📈 **Quality Metrics**: Evaluate conversations across multiple dimensions
        - 🎯 **Filter & Sort**: Find high-quality or interesting conversations
        """)
    else:
        # Create tabs for different views
        tab1, tab2, tab3 = st.tabs(["📋 Browse", "🗺️ Visualize", "📊 Analytics"])
        
        with tab1:
            st.header("Browse Conversations")
            
            # Search and filter
            col1, col2 = st.columns([3, 1])
            with col1:
                search_query = st.text_input("🔍 Search conversations", "")
            with col2:
                sort_by = st.selectbox("Sort by", ["Recent", "Title", "Length"])
            
            # Filter conversations
            filtered_convs = st.session_state.conversations
            if search_query:
                filtered_convs = [
                    c for c in filtered_convs
                    if search_query.lower() in c.get_text().lower() or
                       search_query.lower() in c.metadata.get('title', '').lower()
                ]
            
            # Sort
            if sort_by == "Title":
                filtered_convs = sorted(filtered_convs, key=lambda c: c.metadata.get('title', ''))
            elif sort_by == "Length":
                filtered_convs = sorted(filtered_convs, key=lambda c: len(c.messages), reverse=True)
            
            st.write(f"Showing {len(filtered_convs)} conversations")
            
            # Display conversations
            for i, conv in enumerate(filtered_convs[:20]):  # Limit to 20 for performance
                with st.expander(
                    f"💬 {conv.metadata.get('title', 'Untitled')} ({len(conv.messages)} messages)"
                ):
                    # Show metadata
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.write(f"**ID:** {conv.conversation_id}")
                    with col2:
                        if 'create_time' in conv.metadata and conv.metadata['create_time']:
                            create_time = datetime.fromtimestamp(conv.metadata['create_time'])
                            st.write(f"**Created:** {create_time.strftime('%Y-%m-%d')}")
                    with col3:
                        st.write(f"**Messages:** {len(conv.messages)}")
                    
                    # Show metrics if available
                    if conv.metrics:
                        st.write("**Quality Metrics:**")
                        metric_cols = st.columns(len(conv.metrics))
                        for idx, (metric, value) in enumerate(conv.metrics.items()):
                            with metric_cols[idx]:
                                st.metric(metric.capitalize(), f"{value:.1f}")
                    
                    # Show messages
                    st.write("**Conversation:**")
                    for msg in conv.messages:
                        if msg.role == 'user':
                            st.markdown(f"👤 **User:** {msg.content[:500]}...")
                        elif msg.role == 'assistant':
                            st.markdown(f"🤖 **Assistant:** {msg.content[:500]}...")
        
        with tab2:
            st.header("Embedding Space Visualization")
            
            if not st.session_state.embeddings_computed:
                st.warning("⚠️ Please compute embeddings first (see sidebar)")
            else:
                # Visualization options
                col1, col2, col3 = st.columns(3)
                with col1:
                    viz_method = st.selectbox(
                        "Reduction Method",
                        ["PCA", "t-SNE", "UMAP"],
                        help="Choose dimensionality reduction method"
                    )
                with col2:
                    viz_type = st.selectbox("Visualization Type", ["2D", "3D"])
                with col3:
                    # Get available metrics
                    available_metrics = []
                    if st.session_state.conversations and st.session_state.conversations[0].metrics:
                        available_metrics = list(st.session_state.conversations[0].metrics.keys())
                    
                    color_by = st.selectbox(
                        "Color by",
                        ["None"] + available_metrics,
                        help="Color points by metric value"
                    )
                
                # Create visualization
                if st.button("Generate Visualization") or 'last_viz' in st.session_state:
                    with st.spinner("Creating visualization..."):
                        viz = InteractiveEmbeddingVisualizer(method=viz_method.lower())
                        
                        try:
                            if viz_type == "2D":
                                fig = viz.create_2d_plot(
                                    st.session_state.conversations,
                                    color_by=color_by if color_by != "None" else None,
                                    hover_data=['preview'] + available_metrics
                                )
                            else:
                                fig = viz.create_3d_plot(
                                    st.session_state.conversations,
                                    color_by=color_by if color_by != "None" else None
                                )
                            
                            st.plotly_chart(fig, use_container_width=True)
                            st.session_state.last_viz = True
                            
                        except Exception as e:
                            st.error(f"Error creating visualization: {e}")
        
        with tab3:
            st.header("Analytics & Insights")
            
            if not st.session_state.conversations[0].metrics:
                st.warning("⚠️ Please evaluate conversations first (see sidebar)")
            else:
                # Summary statistics
                st.subheader("📊 Metric Summary")
                
                metrics_data = {}
                for metric in st.session_state.conversations[0].metrics.keys():
                    values = [c.metrics[metric] for c in st.session_state.conversations]
                    metrics_data[metric] = values
                
                # Display metrics
                cols = st.columns(len(metrics_data))
                for idx, (metric, values) in enumerate(metrics_data.items()):
                    with cols[idx]:
                        st.metric(
                            metric.capitalize(),
                            f"{np.mean(values):.2f}",
                            delta=f"±{np.std(values):.2f}"
                        )
                
                # Distribution plots
                st.subheader("📈 Metric Distributions")
                
                df = pd.DataFrame(metrics_data)
                df['conversation_id'] = [c.conversation_id for c in st.session_state.conversations]
                
                # Box plots
                import plotly.graph_objects as go
                fig = go.Figure()
                for metric in metrics_data.keys():
                    fig.add_trace(go.Box(y=df[metric], name=metric.capitalize()))
                
                fig.update_layout(
                    title="Metric Distributions",
                    yaxis_title="Score (0-10)",
                    height=400
                )
                st.plotly_chart(fig, use_container_width=True)
                
                # Top conversations
                st.subheader("⭐ Top Conversations")
                
                metric_to_rank = st.selectbox(
                    "Rank by metric",
                    list(metrics_data.keys())
                )
                
                # Sort and display top 5
                sorted_convs = sorted(
                    st.session_state.conversations,
                    key=lambda c: c.metrics.get(metric_to_rank, 0),
                    reverse=True
                )[:5]
                
                for i, conv in enumerate(sorted_convs):
                    st.write(f"**#{i+1}** {conv.metadata.get('title', 'Untitled')} "
                            f"({metric_to_rank}: {conv.metrics[metric_to_rank]:.2f})")


if __name__ == "__main__":
    main()
