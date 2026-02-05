"""
Interactive Streamlit App for Conversation Embedding Visualization
Enhanced with Model Builder, Tagger, and Global Stats
"""

import streamlit as st
import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime
from collections import Counter
import plotly.graph_objects as go
import plotly.express as px

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from embeddings_space.core.conversation import Conversation, ConversationManager
from embeddings_space.core.embeddings import EmbeddingSpace
from embeddings_space.audit.llm_evaluator import LLMEvaluator, EvaluationMetrics
from embeddings_space.visualizers.interactive_viz import InteractiveEmbeddingVisualizer
from embeddings_space.utils.importers import import_conversations
from embeddings_space.utils.model_builder import IterativeModelBuilder
from embeddings_space.utils.tagger import ConversationTagger

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
if 'model_builder' not in st.session_state:
    st.session_state.model_builder = IterativeModelBuilder()
if 'tagger' not in st.session_state:
    st.session_state.tagger = ConversationTagger()
if 'embeddings_computed' not in st.session_state:
    st.session_state.embeddings_computed = False
if 'user_model' not in st.session_state:
    st.session_state.user_model = None


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


def create_wordcloud_data(conversations):
    """Create word frequency data for word cloud"""
    from collections import Counter
    import re
    
    all_text = " ".join([c.get_text() for c in conversations])
    words = re.findall(r'\b[a-zA-Z]{4,}\b', all_text.lower())
    
    # Filter common words
    stop_words = {'that', 'this', 'with', 'from', 'have', 'will', 'your', 'what', 'when', 
                  'where', 'which', 'there', 'their', 'about', 'would', 'could', 'should'}
    filtered_words = [w for w in words if w not in stop_words]
    
    word_counts = Counter(filtered_words)
    return word_counts.most_common(50)


def main():
    # Title and description
    st.title("🗺️ EmbeddingsSpace Explorer")
    st.markdown("""
    Interactive platform for visualizing and exploring conversation embeddings with advanced analytics.
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
                        import tempfile
                        # Save uploaded file temporarily
                        with tempfile.NamedTemporaryFile(delete=False, suffix=uploaded_file.name) as tmp_file:
                            tmp_file.write(uploaded_file.getbuffer())
                            temp_path = tmp_file.name
                        
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
                metrics_to_eval = st.multiselect(
                    "Select metrics to evaluate",
                    [m.value for m in EvaluationMetrics],
                    default=["coherence", "relevance", "meaningfulness"]
                )
                
                if st.button("Evaluate Conversations"):
                    with st.spinner("Evaluating conversations (using mock mode)..."):
                        progress_bar = st.progress(0)
                        for i, conv in enumerate(st.session_state.conversations):
                            for metric_name in metrics_to_eval:
                                metric = EvaluationMetrics(metric_name)
                                st.session_state.evaluator.evaluate_conversation(
                                    conv, metric, use_mock=True
                                )
                            progress_bar.progress((i + 1) / len(st.session_state.conversations))
                        st.success("✅ Evaluation complete!")
                        st.rerun()
                
                # Tag conversations
                if st.button("Extract Tags & Topics"):
                    with st.spinner("Extracting tags and topics..."):
                        progress_bar = st.progress(0)
                        st.session_state.tagger.tag_conversations(
                            st.session_state.conversations,
                            use_mock=True
                        )
                        progress_bar.progress(1.0)
                        st.success("✅ Tagging complete!")
                        st.rerun()
                
                # Build user model
                if st.button("Build User Profile"):
                    with st.spinner("Building user profile from conversations..."):
                        st.session_state.user_model = st.session_state.model_builder.batch_build_model(
                            st.session_state.conversations,
                            use_mock=True
                        )
                        st.success("✅ User profile built!")
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
        4. **Evaluate & Tag**: Run evaluations and extract topics/keywords
        5. **Explore**: Browse, visualize, and analyze your conversations
        
        ### New Features
        
        - 🎯 **User Profile Builder**: Build iterative user profiles from conversations
        - 🏷️ **Auto-Tagging**: Extract keywords and topics automatically
        - 📈 **Global Statistics**: Word clouds, language analysis, and more
        - 📊 **Enhanced Metrics**: Now includes "Meaningfulness" evaluation
        """)
    else:
        # Create tabs for different views
        tab1, tab2, tab3, tab4, tab5 = st.tabs([
            "📋 Browse", 
            "🗺️ Visualize", 
            "📊 Analytics",
            "🌍 Global Stats",
            "👤 User Profile"
        ])
        
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
                            try:
                                create_time = datetime.fromtimestamp(conv.metadata['create_time'])
                                st.write(f"**Created:** {create_time.strftime('%Y-%m-%d')}")
                            except:
                                pass
                    with col3:
                        st.write(f"**Messages:** {len(conv.messages)}")
                    
                    # Show tags if available
                    if 'tags' in conv.metadata:
                        st.write("**Tags:**", ", ".join(conv.metadata['tags'][:5]))
                    
                    if 'topics' in conv.metadata:
                        st.write("**Topics:**", ", ".join(conv.metadata['topics']))
                    
                    # Show metrics if available
                    if conv.metrics:
                        st.write("**Quality Metrics:**")
                        metric_cols = st.columns(min(len(conv.metrics), 5))
                        for idx, (metric, value) in enumerate(list(conv.metrics.items())[:5]):
                            with metric_cols[idx]:
                                st.metric(metric.capitalize(), f"{value:.1f}")
                    
                    # Show messages
                    st.write("**Conversation:**")
                    for msg in conv.messages:
                        if msg.role == 'user':
                            st.markdown(f"👤 **User:** {msg.content[:300]}...")
                        elif msg.role == 'assistant':
                            st.markdown(f"🤖 **Assistant:** {msg.content[:300]}...")
        
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
                cols = st.columns(min(len(metrics_data), 5))
                for idx, (metric, values) in enumerate(list(metrics_data.items())[:5]):
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
        
        with tab4:
            st.header("🌍 Global Statistics & Language Analysis")
            
            # Overall stats
            st.subheader("📊 Overview")
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                total_words = sum(len(c.get_text().split()) for c in st.session_state.conversations)
                st.metric("Total Words", f"{total_words:,}")
            
            with col2:
                avg_length = total_words / len(st.session_state.conversations)
                st.metric("Avg Words/Conv", f"{avg_length:.0f}")
            
            with col3:
                total_chars = sum(len(c.get_text()) for c in st.session_state.conversations)
                st.metric("Total Characters", f"{total_chars:,}")
            
            with col4:
                if st.session_state.conversations[0].metrics:
                    avg_quality = np.mean([
                        np.mean(list(c.metrics.values()))
                        for c in st.session_state.conversations
                        if c.metrics
                    ])
                    st.metric("Avg Quality", f"{avg_quality:.2f}/10")
            
            # Word frequency analysis
            st.subheader("🔤 Word Frequency Analysis")
            
            word_data = create_wordcloud_data(st.session_state.conversations)
            
            # Create bar chart for top words
            words, counts = zip(*word_data[:20])
            fig = px.bar(
                x=list(counts),
                y=list(words),
                orientation='h',
                title="Top 20 Most Frequent Words",
                labels={'x': 'Frequency', 'y': 'Word'}
            )
            fig.update_layout(yaxis={'categoryorder':'total ascending'})
            st.plotly_chart(fig, use_container_width=True)
            
            # Topic distribution
            if 'topics' in st.session_state.conversations[0].metadata:
                st.subheader("📚 Topic Distribution")
                
                all_topics = []
                for conv in st.session_state.conversations:
                    all_topics.extend(conv.metadata.get('topics', []))
                
                topic_counts = Counter(all_topics)
                
                if topic_counts:
                    topics, counts = zip(*topic_counts.most_common(10))
                    fig = px.pie(
                        values=list(counts),
                        names=list(topics),
                        title="Topic Distribution"
                    )
                    st.plotly_chart(fig, use_container_width=True)
            
            # Category distribution
            if 'categories' in st.session_state.conversations[0].metadata:
                st.subheader("🏷️ Category Distribution")
                
                all_categories = []
                for conv in st.session_state.conversations:
                    all_categories.extend(conv.metadata.get('categories', []))
                
                category_counts = Counter(all_categories)
                
                if category_counts:
                    fig = px.bar(
                        x=list(category_counts.keys()),
                        y=list(category_counts.values()),
                        title="Conversations by Category",
                        labels={'x': 'Category', 'y': 'Count'}
                    )
                    st.plotly_chart(fig, use_container_width=True)
            
            # Timeline analysis
            st.subheader("📅 Conversation Timeline")
            
            dated_convs = [
                c for c in st.session_state.conversations
                if 'create_time' in c.metadata and c.metadata['create_time']
            ]
            
            if dated_convs:
                dates = []
                for c in dated_convs:
                    try:
                        dt = datetime.fromtimestamp(c.metadata['create_time'])
                        dates.append(dt.date())
                    except:
                        pass
                
                if dates:
                    date_counts = Counter(dates)
                    df_timeline = pd.DataFrame({
                        'Date': list(date_counts.keys()),
                        'Count': list(date_counts.values())
                    }).sort_values('Date')
                    
                    fig = px.line(
                        df_timeline,
                        x='Date',
                        y='Count',
                        title="Conversations Over Time",
                        markers=True
                    )
                    st.plotly_chart(fig, use_container_width=True)
        
        with tab5:
            st.header("👤 User Profile")
            
            if st.session_state.user_model is None:
                st.info("Build a user profile from conversations using the sidebar")
                
                st.markdown("""
                ### About User Profile Builder
                
                The user profile builder analyzes all your conversations to create a comprehensive profile including:
                
                - **Interests**: Topics and subjects you discuss frequently
                - **Expertise Areas**: Domains where you show knowledge or ask questions
                - **Communication Style**: How you communicate (formal, casual, technical, etc.)
                - **Goals**: Apparent goals or objectives from your conversations
                - **Language Patterns**: Notable patterns in your language use
                
                Click "Build User Profile" in the sidebar to get started.
                """)
            else:
                st.success("✅ User profile built!")
                
                # Display the profile
                st.subheader("📋 Profile Summary")
                
                # Interests
                if 'interests' in st.session_state.user_model:
                    st.write("**Interests:**")
                    interests = st.session_state.user_model['interests']
                    if interests:
                        st.write(", ".join(interests))
                    else:
                        st.write("No specific interests identified yet")
                
                # Expertise areas
                if 'expertise_areas' in st.session_state.user_model:
                    st.write("**Expertise Areas:**")
                    expertise = st.session_state.user_model['expertise_areas']
                    if expertise:
                        st.write(", ".join(expertise))
                    else:
                        st.write("No specific expertise areas identified yet")
                
                # Communication style
                if 'communication_style' in st.session_state.user_model:
                    st.write("**Communication Style:**")
                    st.write(st.session_state.user_model['communication_style'])
                
                # Goals
                if 'goals' in st.session_state.user_model:
                    st.write("**Goals:**")
                    goals = st.session_state.user_model['goals']
                    if goals:
                        for goal in goals:
                            st.write(f"- {goal}")
                    else:
                        st.write("No specific goals identified yet")
                
                # Stats
                if 'conversation_count' in st.session_state.user_model:
                    st.write(f"**Conversations Analyzed:** {st.session_state.user_model['conversation_count']}")
                
                # Raw model data (collapsible)
                with st.expander("View Raw Profile Data"):
                    st.json(st.session_state.user_model)


if __name__ == "__main__":
    main()
