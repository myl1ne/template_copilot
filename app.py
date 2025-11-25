"""
Company Ontology & Entity Understanding Platform

A Streamlit application for visualizing:
- Company ontology trees extracted from email data
- Spatiotemporal entities on interactive maps with timelines
- Entity relationship graphs
"""

import streamlit as st
import json
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import networkx as nx

# Import data and visualization modules
from sample_data import get_sample_ontology, get_sample_entities
from visualizations import (
    render_ontology_tree, 
    get_tree_statistics,
    render_spatiotemporal_map,
    render_timeline,
    render_entity_graph,
    get_graph_statistics
)

# Page configuration
st.set_page_config(
    page_title="Company Understanding Platform",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main > div {
        padding-top: 2rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 1rem 2rem;
        font-weight: 600;
    }
    h1 {
        color: #667eea;
    }
    h2 {
        color: #764ba2;
    }
</style>
""", unsafe_allow_html=True)

# Title
st.title("🏢 Company Ontology & Entity Understanding Platform")
st.markdown("**Autonomous entity extraction and visualization from email data**")
st.divider()

# Initialize session state
if 'ontology_data' not in st.session_state:
    st.session_state.ontology_data = None
if 'entity_data' not in st.session_state:
    st.session_state.entity_data = None

# Sidebar for data loading
with st.sidebar:
    st.header("📁 Data Management")
    
    data_source = st.radio(
        "Select Data Source",
        ["Sample Data", "Upload Custom Data"],
        index=0
    )
    
    if data_source == "Sample Data":
        sample_choice = st.selectbox(
            "Choose Sample Dataset",
            ["Tech Company", "Marketing Department", "Enterprise Organization"]
        )
        
        if st.button("Load Sample Data", type="primary"):
            st.session_state.ontology_data = get_sample_ontology(sample_choice)
            st.session_state.entity_data = get_sample_entities(sample_choice)
            st.success("✅ Sample data loaded successfully!")
    
    else:
        st.subheader("Upload Ontology JSON")
        ontology_file = st.file_uploader(
            "Upload ontology tree",
            type=['json'],
            key='ontology_upload'
        )
        
        st.subheader("Upload Entities JSON")
        entities_file = st.file_uploader(
            "Upload entity instances",
            type=['json'],
            key='entities_upload'
        )
        
        if st.button("Load Custom Data", type="primary"):
            if ontology_file and entities_file:
                try:
                    st.session_state.ontology_data = json.load(ontology_file)
                    st.session_state.entity_data = json.load(entities_file)
                    st.success("✅ Custom data loaded successfully!")
                    st.rerun()
                except Exception as e:
                    st.error(f"❌ Error loading data: {str(e)}")
            else:
                st.warning("⚠️ Please upload both files")
    
    st.divider()
    
    # Data info
    if st.session_state.ontology_data:
        st.metric("Ontology Loaded", "✓", delta="Ready")
    if st.session_state.entity_data:
        entity_count = len(st.session_state.entity_data)
        st.metric("Entities Loaded", entity_count, delta="Ready")

# Main content area
if not st.session_state.ontology_data and not st.session_state.entity_data:
    st.info("👈 Please load data from the sidebar to begin")
    
    # Show sample data format
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📋 Ontology Format")
        st.code('''{
  "entity_type": "Organization",
  "description": "Root organization",
  "children": [
    {
      "entity_type": "Department",
      "description": "Sub-department",
      "children": []
    }
  ]
}''', language='json')
    
    with col2:
        st.subheader("📋 Entity Data Format")
        st.code('''{
  "email_id": "email_123",
  "detected_entities": [
    {
      "entity_text": "John Doe",
      "entity_type": "Person",
      "entity_instance": "john.doe",
      "location": "New York",
      "timestamp": "2024-01-15"
    }
  ]
}''', language='json')

else:
    # Create tabs for different visualizations
    tab1, tab2, tab3 = st.tabs([
        "🌳 Ontology Tree",
        "🗺️ Spatiotemporal Map",
        "🔗 Entity Graph"
    ])
    
    # Tab 1: Ontology Tree Visualization
    with tab1:
        st.header("Ontology Tree Visualization")
        
        if st.session_state.ontology_data:
            col1, col2 = st.columns([3, 1])
            
            with col1:
                st.subheader("Interactive Tree View")
                render_ontology_tree(st.session_state.ontology_data)
            
            with col2:
                st.subheader("Tree Statistics")
                stats = get_tree_statistics(st.session_state.ontology_data)
                st.metric("Total Nodes", stats['total_nodes'])
                st.metric("Max Depth", stats['max_depth'])
                st.metric("Leaf Nodes", stats['leaf_nodes'])
                st.metric("Avg Children", f"{stats['avg_children']:.2f}")
        else:
            st.warning("No ontology data loaded")
    
    # Tab 2: Spatiotemporal Map
    with tab2:
        st.header("Spatiotemporal Entity Visualization")
        
        if st.session_state.entity_data:
            st.subheader("🗺️ Geographic Distribution")
            render_spatiotemporal_map(st.session_state.entity_data)
            
            st.divider()
            
            st.subheader("📅 Temporal Timeline")
            render_timeline(st.session_state.entity_data)
        else:
            st.warning("No entity data loaded")
    
    # Tab 3: Entity Relationship Graph
    with tab3:
        st.header("Entity Relationship Graph")
        
        if st.session_state.entity_data:
            col1, col2 = st.columns([3, 1])
            
            with col1:
                st.subheader("Entity Network")
                render_entity_graph(st.session_state.entity_data)
            
            with col2:
                st.subheader("Graph Statistics")
                stats = get_graph_statistics(st.session_state.entity_data)
                st.metric("Total Entities", stats['total_entities'])
                st.metric("Connections", stats['total_connections'])
                st.metric("Entity Types", stats['unique_types'])
                st.metric("Avg Degree", f"{stats['avg_degree']:.2f}")
        else:
            st.warning("No entity data loaded")

# Footer
st.divider()
st.markdown("""
<div style='text-align: center; color: #666; padding: 20px;'>
    <p>Company Understanding Platform | Powered by Autonomous Ontology Extraction</p>
</div>
""", unsafe_allow_html=True)
