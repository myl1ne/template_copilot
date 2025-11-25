"""
Visualization functions for the Company Understanding Platform
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import networkx as nx


def render_ontology_tree(ontology_data):
    """Render an interactive ontology tree visualization"""
    
    # Create tree structure for Plotly
    def build_tree_data(node, parent_name="", level=0):
        nodes = []
        edges = []
        
        node_name = node['entity_type']
        full_name = f"{parent_name}/{node_name}" if parent_name else node_name
        
        nodes.append({
            'name': node_name,
            'full_name': full_name,
            'description': node['description'],
            'level': level,
            'children_count': len(node.get('children', []))
        })
        
        if parent_name:
            edges.append((parent_name, full_name))
        
        for child in node.get('children', []):
            child_nodes, child_edges = build_tree_data(child, full_name, level + 1)
            nodes.extend(child_nodes)
            edges.extend(child_edges)
        
        return nodes, edges
    
    nodes, edges = build_tree_data(ontology_data)
    
    # Display using expanders for hierarchical view
    def render_node(node, level=0):
        indent = "&nbsp;&nbsp;" * level
        if level == 0:
            with st.expander(f"📁 **{node['entity_type']}**", expanded=True):
                st.markdown(f"*{node['description']}*")
                if node.get('children'):
                    st.caption(f"Children: {len(node['children'])}")
                    for child in node['children']:
                        render_node(child, level + 1)
                else:
                    st.caption("🍃 Leaf node")
        else:
            st.markdown(f"{indent}📁 **{node['entity_type']}**  ")
            st.markdown(f"{indent}*{node['description']}*")
            if node.get('children'):
                st.caption(f"{indent}Children: {len(node['children'])}")
                for child in node['children']:
                    render_node(child, level + 1)
            else:
                st.caption(f"{indent}🍃 Leaf node")
    
    render_node(ontology_data, 0)
    
    # Alternative: Sunburst chart visualization
    st.subheader("Hierarchical Sunburst View")
    
    df_nodes = pd.DataFrame(nodes)
    
    fig = px.sunburst(
        df_nodes,
        names='name',
        parents=[n.rsplit('/', 1)[0] if '/' in n else '' for n in df_nodes['full_name']],
        values=[1] * len(df_nodes),
        hover_data=['description'],
        color='level',
        color_continuous_scale='Viridis',
        title='Ontology Tree Structure'
    )
    
    fig.update_layout(
        height=600,
        margin=dict(t=50, l=0, r=0, b=0)
    )
    
    st.plotly_chart(fig, use_container_width=True)


def get_tree_statistics(ontology_data):
    """Calculate statistics about the ontology tree"""
    
    def traverse(node, depth=0):
        stats = {
            'total': 1,
            'max_depth': depth,
            'leaves': 0 if node.get('children') else 1,
            'children_counts': [len(node.get('children', []))]
        }
        
        for child in node.get('children', []):
            child_stats = traverse(child, depth + 1)
            stats['total'] += child_stats['total']
            stats['max_depth'] = max(stats['max_depth'], child_stats['max_depth'])
            stats['leaves'] += child_stats['leaves']
            stats['children_counts'].extend(child_stats['children_counts'])
        
        return stats
    
    stats = traverse(ontology_data)
    
    # Prevent division by zero
    avg_children = 0
    if len(stats['children_counts']) > 0:
        avg_children = sum(stats['children_counts']) / len(stats['children_counts'])
    
    return {
        'total_nodes': stats['total'],
        'max_depth': stats['max_depth'] + 1,
        'leaf_nodes': stats['leaves'],
        'avg_children': avg_children
    }


def render_spatiotemporal_map(entity_data):
    """Render entities on an interactive map"""
    
    # Extract all entities with location data
    entities_flat = []
    for email in entity_data:
        for entity in email['detected_entities']:
            if 'latitude' in entity and 'longitude' in entity:
                entities_flat.append({
                    'email_id': email['email_id'],
                    'entity_text': entity['entity_text'],
                    'entity_type': entity['entity_type'],
                    'location': entity.get('location', 'Unknown'),
                    'latitude': entity['latitude'],
                    'longitude': entity['longitude'],
                    'timestamp': entity.get('timestamp', ''),
                    'confidence': entity.get('confidence', 1.0)
                })
    
    if not entities_flat:
        st.warning("No spatiotemporal data available")
        return
    
    df = pd.DataFrame(entities_flat)
    
    # Filters
    col1, col2, col3 = st.columns(3)
    
    with col1:
        selected_types = st.multiselect(
            "Filter by Entity Type",
            options=df['entity_type'].unique().tolist(),
            default=df['entity_type'].unique().tolist()
        )
    
    with col2:
        min_confidence = st.slider(
            "Minimum Confidence",
            min_value=0.0,
            max_value=1.0,
            value=0.5,
            step=0.1
        )
    
    with col3:
        selected_locations = st.multiselect(
            "Filter by Location",
            options=df['location'].unique().tolist(),
            default=df['location'].unique().tolist()
        )
    
    # Apply filters
    df_filtered = df[
        (df['entity_type'].isin(selected_types)) &
        (df['confidence'] >= min_confidence) &
        (df['location'].isin(selected_locations))
    ]
    
    # Create map
    fig = px.scatter_mapbox(
        df_filtered,
        lat='latitude',
        lon='longitude',
        color='entity_type',
        size='confidence',
        hover_name='entity_text',
        hover_data={
            'location': True,
            'timestamp': True,
            'confidence': ':.2f',
            'latitude': False,
            'longitude': False
        },
        zoom=1,
        height=500,
        title=f'Entity Distribution ({len(df_filtered)} entities)'
    )
    
    fig.update_layout(
        mapbox_style="open-street-map",
        margin={"r": 0, "t": 40, "l": 0, "b": 0}
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Show summary table
    st.subheader("Entity Summary")
    summary = df_filtered.groupby('entity_type').agg({
        'entity_text': 'count',
        'location': 'nunique',
        'confidence': 'mean'
    }).round(2)
    summary.columns = ['Count', 'Unique Locations', 'Avg Confidence']
    st.dataframe(summary, use_container_width=True)


def render_timeline(entity_data):
    """Render a timeline of entity detections"""
    
    # Extract entities with timestamps
    entities_flat = []
    for email in entity_data:
        for entity in email['detected_entities']:
            # Skip entities with invalid or missing timestamps
            if 'timestamp' in entity and entity['timestamp']:
                try:
                    entities_flat.append({
                        'email_id': email['email_id'],
                        'entity_text': entity['entity_text'],
                        'entity_type': entity['entity_type'],
                        'timestamp': entity['timestamp'],
                        'location': entity.get('location', 'Unknown')
                    })
                except (ValueError, TypeError):
                    # Skip invalid timestamp formats
                    continue
    
    if not entities_flat:
        st.warning("No temporal data available")
        return
    
    df = pd.DataFrame(entities_flat)
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
    
    # Remove any rows with invalid timestamps
    df = df.dropna(subset=['timestamp'])
    
    if df.empty:
        st.warning("No valid temporal data available")
        return
    
    df['date'] = df['timestamp'].dt.date
    
    # Timeline aggregation
    timeline_data = df.groupby(['date', 'entity_type']).size().reset_index(name='count')
    
    fig = px.line(
        timeline_data,
        x='date',
        y='count',
        color='entity_type',
        title='Entity Detection Timeline',
        labels={'date': 'Date', 'count': 'Number of Entities'},
        markers=True
    )
    
    fig.update_layout(
        height=400,
        hovermode='x unified',
        xaxis_title='Date',
        yaxis_title='Entity Count'
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Activity heatmap
    st.subheader("Activity Heatmap")
    
    df['weekday'] = df['timestamp'].dt.day_name()
    df['hour'] = df['timestamp'].dt.hour
    
    heatmap_data = df.groupby(['weekday', 'hour']).size().reset_index(name='count')
    
    # Pivot for heatmap
    heatmap_pivot = heatmap_data.pivot(index='weekday', columns='hour', values='count').fillna(0)
    
    # Reorder weekdays
    weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    heatmap_pivot = heatmap_pivot.reindex([day for day in weekday_order if day in heatmap_pivot.index])
    
    fig_heatmap = px.imshow(
        heatmap_pivot,
        labels=dict(x="Hour of Day", y="Day of Week", color="Entity Count"),
        color_continuous_scale='YlOrRd',
        aspect="auto"
    )
    
    fig_heatmap.update_layout(height=300)
    
    st.plotly_chart(fig_heatmap, use_container_width=True)


def _build_entity_graph(entity_data):
    """Build a NetworkX graph from entity co-occurrence data"""
    G = nx.Graph()
    
    # Add entities and connections
    entity_types = {}
    
    for email in entity_data:
        entities = email['detected_entities']
        
        # Add nodes
        for entity in entities:
            node_id = entity['entity_instance']
            if node_id not in entity_types:
                entity_types[node_id] = entity['entity_type']
                G.add_node(node_id, 
                          text=entity['entity_text'],
                          type=entity['entity_type'])
        
        # Add edges for entities in same email
        for i, entity1 in enumerate(entities):
            for entity2 in entities[i+1:]:
                id1 = entity1['entity_instance']
                id2 = entity2['entity_instance']
                
                if G.has_edge(id1, id2):
                    G[id1][id2]['weight'] += 1
                else:
                    G.add_edge(id1, id2, weight=1)
    
    return G, entity_types


def render_entity_graph(entity_data):
    """Render entity relationship graph"""
    
    # Build graph from co-occurrence in emails
    G, entity_types = _build_entity_graph(entity_data)
    
    if G.number_of_nodes() == 0:
        st.warning("No entity relationships found")
        return
    
    # Graph layout
    layout_type = st.selectbox(
        "Graph Layout",
        ["Spring", "Circular", "Kamada-Kawai"],
        index=0
    )
    
    if layout_type == "Spring":
        pos = nx.spring_layout(G, k=1, iterations=50)
    elif layout_type == "Circular":
        pos = nx.circular_layout(G)
    else:
        pos = nx.kamada_kawai_layout(G)
    
    # Create edge trace
    edge_trace = []
    for edge in G.edges(data=True):
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        weight = edge[2].get('weight', 1)
        
        edge_trace.append(
            go.Scatter(
                x=[x0, x1, None],
                y=[y0, y1, None],
                mode='lines',
                line=dict(width=weight * 0.5, color='#888'),
                hoverinfo='none',
                showlegend=False
            )
        )
    
    # Create node trace
    node_x = []
    node_y = []
    node_text = []
    node_color = []
    node_size = []
    
    # Color mapping for entity types
    unique_types = list(set(entity_types.values()))
    color_map = {t: i for i, t in enumerate(unique_types)}
    
    for node in G.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)
        node_text.append(f"{G.nodes[node]['text']}<br>Type: {G.nodes[node]['type']}<br>Connections: {G.degree(node)}")
        node_color.append(color_map[G.nodes[node]['type']])
        node_size.append(10 + G.degree(node) * 2)
    
    node_trace = go.Scatter(
        x=node_x,
        y=node_y,
        mode='markers+text',
        hoverinfo='text',
        text=list(G.nodes()),
        textposition="top center",
        textfont=dict(size=8),
        hovertext=node_text,
        marker=dict(
            size=node_size,
            color=node_color,
            colorscale='Viridis',
            line=dict(width=2, color='white'),
            showscale=False
        ),
        showlegend=False
    )
    
    # Create figure
    fig = go.Figure(data=edge_trace + [node_trace])
    
    fig.update_layout(
        title='Entity Relationship Network',
        showlegend=False,
        hovermode='closest',
        height=600,
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        plot_bgcolor='white'
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Network statistics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Network Density", f"{nx.density(G):.3f}")
    
    with col2:
        if G.number_of_nodes() > 0:
            avg_clustering = nx.average_clustering(G)
            st.metric("Avg Clustering", f"{avg_clustering:.3f}")
    
    with col3:
        components = nx.number_connected_components(G)
        st.metric("Connected Components", components)


def get_graph_statistics(entity_data):
    """Calculate statistics about the entity graph"""
    
    # Build graph using shared helper
    G, _ = _build_entity_graph(entity_data)
    
    # Get unique entity types
    entity_types = set()
    for email in entity_data:
        for entity in email['detected_entities']:
            entity_types.add(entity['entity_type'])
    
    avg_degree = sum(dict(G.degree()).values()) / G.number_of_nodes() if G.number_of_nodes() > 0 else 0
    
    return {
        'total_entities': G.number_of_nodes(),
        'total_connections': G.number_of_edges(),
        'unique_types': len(entity_types),
        'avg_degree': avg_degree
    }
