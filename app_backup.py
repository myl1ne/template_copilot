"""
Interactive Streamlit App for Conversation Embedding Visualization
"""

import streamlit as st
import sys
import os
import tempfile
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

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

# Persistence configuration
PERSISTENCE_DIR = Path(__file__).parent / 'data' / 'persistence'
PERSISTENCE_DIR.mkdir(parents=True, exist_ok=True)
PERSISTENCE_FILE = PERSISTENCE_DIR / 'conversations_state.json'

# Initialize session state
if 'conversations' not in st.session_state:
    st.session_state.conversations = []
if 'conversation_manager' not in st.session_state:
    st.session_state.conversation_manager = ConversationManager()
if 'embedding_space' not in st.session_state:
    st.session_state.embedding_space = EmbeddingSpace()
if 'evaluator' not in st.session_state:
    st.session_state.evaluator = LLMEvaluator()
if 'auto_loaded' not in st.session_state:
    st.session_state.auto_loaded = False
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
    # Auto-load previously saved state on first run
    if not st.session_state.auto_loaded and PERSISTENCE_FILE.exists():
        try:
            st.session_state.conversation_manager.load_from_json(str(PERSISTENCE_FILE))
            st.session_state.conversations = st.session_state.conversation_manager.conversations
            
            # Check if ALL conversations have embeddings (not just any)
            if st.session_state.conversations:
                embeddings_count = sum(1 for conv in st.session_state.conversations if conv.embedding is not None)
                total_count = len(st.session_state.conversations)
                st.session_state.embeddings_computed = (embeddings_count == total_count)
            else:
                st.session_state.embeddings_computed = False
            
            st.session_state.auto_loaded = True
            st.toast(f"✅ Restored {len(st.session_state.conversations)} conversations from previous session", icon="💾")
        except Exception as e:
            st.toast(f"⚠️ Could not restore previous session: {e}", icon="⚠️")
            st.session_state.auto_loaded = True
    
    # Title and description
    st.title("🗺️ EmbeddingsSpace Explorer")
    st.markdown("""
    Interactive platform for visualizing and exploring conversation embeddings.
    Upload your ChatGPT conversations or use sample data to get started.
    """)
    
    # Sidebar
    with st.sidebar:
        st.header("📊 Data Management")
        
        # Persistence controls
        st.subheader("💾 Save/Load State")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("💾 Save", use_container_width=True, help="Save current progress"):
                try:
                    st.session_state.conversation_manager.save_to_json(str(PERSISTENCE_FILE))
                    st.success("Saved!")
                except Exception as e:
                    st.error(f"Save failed: {e}")
        with col2:
            if st.button("📂 Load", use_container_width=True, help="Load saved progress"):
                try:
                    st.session_state.conversation_manager.load_from_json(str(PERSISTENCE_FILE))
                    st.session_state.conversations = st.session_state.conversation_manager.conversations
                    if st.session_state.conversations:
                        embeddings_count = sum(1 for conv in st.session_state.conversations if conv.embedding is not None)
                        total_count = len(st.session_state.conversations)
                        st.session_state.embeddings_computed = (embeddings_count == total_count)
                    else:
                        st.session_state.embeddings_computed = False
                    st.success(f"Loaded {len(st.session_state.conversations)} conversations!")
                    st.rerun()
                except Exception as e:
                    st.error(f"Load failed: {e}")
        
        if PERSISTENCE_FILE.exists():
            file_size = PERSISTENCE_FILE.stat().st_size / (1024 * 1024)  # MB
            st.caption(f"Saved state: {file_size:.1f}MB")
        
        st.divider()
        
        # File upload
        st.subheader("Import Conversations")
        
        # Option to merge or replace
        import_mode = st.radio(
            "Import Mode",
            ["Replace All", "Merge/Append"],
            help="Replace: Clear existing conversations. Merge: Add to existing conversations.",
            horizontal=True
        )
        
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
                        with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix=Path(uploaded_file.name).suffix) as tmp:
                            tmp.write(uploaded_file.getbuffer())
                            temp_path = tmp.name
                        
                        # Import conversations
                        new_conversations = import_conversations(temp_path, format='chatgpt')
                        
                        if import_mode == "Replace All":
                            # Replace existing conversations
                            st.session_state.conversations = new_conversations
                            st.session_state.conversation_manager = ConversationManager()
                            for conv in new_conversations:
                                st.session_state.conversation_manager.add_conversation(conv)
                            st.success(f"✅ Loaded {len(new_conversations)} conversations!")
                        else:
                            # Merge with existing conversations
                            existing_ids = {c.conversation_id for c in st.session_state.conversations}
                            merged_count = 0
                            duplicate_count = 0
                            
                            for conv in new_conversations:
                                if conv.conversation_id not in existing_ids:
                                    st.session_state.conversation_manager.add_conversation(conv)
                                    st.session_state.conversations.append(conv)
                                    merged_count += 1
                                else:
                                    duplicate_count += 1
                            
                            st.success(f"✅ Added {merged_count} new conversations! (Skipped {duplicate_count} duplicates)")
                        
                        # Check if embeddings are still complete
                        if st.session_state.conversations:
                            embeddings_count = sum(1 for conv in st.session_state.conversations if conv.embedding is not None)
                            total_count = len(st.session_state.conversations)
                            st.session_state.embeddings_computed = (embeddings_count == total_count)
                        else:
                            st.session_state.embeddings_computed = False
                        
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
                # Check how many conversations already have embeddings
                processed_count = sum(1 for conv in st.session_state.conversations if conv.embedding is not None)
                total_count = len(st.session_state.conversations)
                
                if processed_count > 0:
                    progress_pct = (processed_count / total_count) * 100
                    st.info(f"📊 {processed_count}/{total_count} conversations processed ({progress_pct:.1f}%)")
                
                button_label = "Resume Computing Embeddings" if processed_count > 0 else "Compute Embeddings"
                if st.button(button_label):
                    with st.spinner("Processing conversations and computing embeddings..."):
                        progress_bar = st.progress(0)
                        status_text = st.empty()
                        processed = 0
                        
                        for i, conv in enumerate(st.session_state.conversations):
                            # Skip if already has embedding
                            if conv.embedding is not None:
                                progress_bar.progress((i + 1) / total_count)
                                continue
                            
                            processed += 1
                            status_text.text(f"Processing conversation {i+1}/{total_count}: {(conv.metadata.get('title') or 'Untitled')[:50]}...")
                            st.session_state.embedding_space.embed_conversation(conv)
                            progress_bar.progress((i + 1) / total_count)
                            
                            # Auto-save every 10 conversations
                            if processed % 10 == 0:
                                try:
                                    st.session_state.conversation_manager.save_to_json(str(PERSISTENCE_FILE))
                                    status_text.text(f"✅ Saved progress: {i+1}/{total_count} conversations processed")
                                except Exception as e:
                                    st.warning(f"Failed to save progress: {e}")
                                    status_text.text(f"Saved progress: {i+1}/{len(st.session_state.conversations)} conversations processed")
                                except Exception as e:
                                    st.warning(f"Failed to save progress: {e}")
                        
                        # Final save
                        st.session_state.conversation_manager.save_to_json(str(PERSISTENCE_FILE))
                        status_text.empty()
                        st.session_state.embeddings_computed = True
                        st.success("✅ Embeddings computed and saved!")
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
            col1, col2, col3 = st.columns([3, 1, 1])
            with col1:
                search_query = st.text_input("🔍 Search conversations", "")
            with col2:
                sort_by = st.selectbox("Sort by", ["Recent", "Title", "Length"])
            with col3:
                sort_direction = st.selectbox("Direction", ["Descending", "Ascending"])
            
            # Filter conversations
            filtered_convs = st.session_state.conversations
            if search_query:
                filtered_convs = [
                    c for c in filtered_convs
                    if search_query.lower() in c.get_text().lower() or
                       search_query.lower() in (c.metadata.get('title') or '').lower()
                ]
            
            # Sort
            reverse = (sort_direction == "Descending")
            if sort_by == "Title":
                filtered_convs = sorted(filtered_convs, key=lambda c: (c.metadata.get('title') or '').lower(), reverse=reverse)
            elif sort_by == "Length":
                filtered_convs = sorted(filtered_convs, key=lambda c: len(c.messages), reverse=reverse)
            elif sort_by == "Recent":
                # Sort by creation time if available, otherwise keep original order
                filtered_convs = sorted(filtered_convs, key=lambda c: c.metadata.get('create_time', 0), reverse=reverse)
            
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
                        viz = InteractiveEmbeddingVisualizer(method=(viz_method or "PCA").lower())
                        
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
            
            # Summary statistics section
            st.subheader("📝 Processing Summary")
            col1, col2, col3 = st.columns(3)
            with col1:
                embeddings_count = sum(1 for c in st.session_state.conversations if c.embedding is not None)
                st.metric("Embeddings Computed", f"{embeddings_count}/{len(st.session_state.conversations)}")
            with col2:
                summaries_count = sum(1 for c in st.session_state.conversations if c.summary is not None)
                st.metric("Summaries Generated", f"{summaries_count}/{len(st.session_state.conversations)}")
            with col3:
                metrics_count = sum(1 for c in st.session_state.conversations if c.metrics)
                st.metric("Conversations Evaluated", f"{metrics_count}/{len(st.session_state.conversations)}")
            
            # Show summary length distribution if summaries exist
            if summaries_count > 0:
                st.subheader("📊 Summary Statistics")
                summary_lengths = [len(c.summary.split()) for c in st.session_state.conversations if c.summary]
                original_lengths = [len(c.get_text().split()) for c in st.session_state.conversations if c.summary]
                
                col1, col2 = st.columns(2)
                with col1:
                    st.metric("Avg Summary Length", f"{np.mean(summary_lengths):.0f} words")
                    st.metric("Avg Original Length", f"{np.mean(original_lengths):.0f} words")
                with col2:
                    compression_ratio = (np.mean(summary_lengths) / np.mean(original_lengths)) * 100
                    st.metric("Compression Ratio", f"{compression_ratio:.1f}%")
                    st.metric("Total Summaries", summaries_count)
            
            st.divider()
            
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
