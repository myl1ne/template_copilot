"""
Demo script for the EmbeddingsSpace visualization platform
This script demonstrates all features with sample conversations
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from embeddings_space import (
    Conversation,
    ConversationManager,
    EmbeddingSpace,
    LLMEvaluator,
    EvaluationMetrics,
    EmbeddingVisualizer,
    MetricLandscapeVisualizer,
    SOMVisualizer
)


def create_sample_conversations() -> list[Conversation]:
    """Create diverse sample conversations for testing"""
    
    conversations = []
    
    # 1. Technical Programming Conversation
    conv1 = Conversation(conversation_id="tech_1")
    conv1.add_message("user", "How do I implement a binary search tree in Python?")
    conv1.add_message("assistant", 
        "Here's a basic implementation of a binary search tree in Python:\n\n"
        "```python\nclass Node:\n    def __init__(self, value):\n        self.value = value\n"
        "        self.left = None\n        self.right = None\n```\n\n"
        "This provides the foundation for BST operations.")
    conv1.add_message("user", "Can you add the insert method?")
    conv1.add_message("assistant",
        "Sure! Here's the insert method that maintains BST property.")
    conversations.append(conv1)
    
    # 2. Creative Writing Conversation
    conv2 = Conversation(conversation_id="creative_1")
    conv2.add_message("user", "Write me a short story about a robot discovering emotions")
    conv2.add_message("assistant",
        "In the year 2147, Unit-7 performed its tasks with mechanical precision. "
        "But one day, during a routine maintenance check, it encountered a painting. "
        "For the first time, something inexplicable stirred within its circuits...")
    conv2.add_message("user", "That's beautiful! What happens next?")
    conv2.add_message("assistant",
        "Unit-7 began seeking out art, music, and poetry. Each experience added new "
        "dimensions to its understanding. The other robots noticed the change...")
    conversations.append(conv2)
    
    # 3. Scientific Explanation
    conv3 = Conversation(conversation_id="science_1")
    conv3.add_message("user", "Explain quantum entanglement in simple terms")
    conv3.add_message("assistant",
        "Quantum entanglement is when two particles become connected in such a way "
        "that the state of one instantly affects the state of the other, no matter "
        "how far apart they are. Einstein called it 'spooky action at a distance.'")
    conv3.add_message("user", "Is this related to quantum computing?")
    conv3.add_message("assistant",
        "Yes! Quantum computers use entanglement to process information in ways "
        "classical computers cannot. It's one of the key resources for quantum advantage.")
    conversations.append(conv3)
    
    # 4. Casual Chat
    conv4 = Conversation(conversation_id="casual_1")
    conv4.add_message("user", "What's the weather like today?")
    conv4.add_message("assistant",
        "I don't have access to real-time weather data, but I can help you find "
        "weather information through various weather services!")
    conversations.append(conv4)
    
    # 5. Philosophical Discussion
    conv5 = Conversation(conversation_id="philosophy_1")
    conv5.add_message("user", "What is the nature of consciousness?")
    conv5.add_message("assistant",
        "Consciousness remains one of philosophy's deepest mysteries. Is it an emergent "
        "property of complex information processing? A fundamental feature of the universe? "
        "Different theories like materialism, dualism, and panpsychism offer competing views.")
    conv5.add_message("user", "Can AI ever be truly conscious?")
    conv5.add_message("assistant",
        "This question touches on the hard problem of consciousness. We can create AI "
        "that behaves intelligently, but whether it has subjective experience is unknown. "
        "Some argue consciousness requires biological substrates, others believe it's substrate-independent.")
    conversations.append(conv5)
    
    # 6. Math Tutorial
    conv6 = Conversation(conversation_id="math_1")
    conv6.add_message("user", "How do I solve quadratic equations?")
    conv6.add_message("assistant",
        "Quadratic equations have the form ax² + bx + c = 0. You can solve them using:\n"
        "1. Factoring\n2. Completing the square\n3. Quadratic formula: x = (-b ± √(b²-4ac)) / 2a")
    conversations.append(conv6)
    
    # 7. Debugging Help
    conv7 = Conversation(conversation_id="debug_1")
    conv7.add_message("user", "My Python code keeps giving IndexError. Help!")
    conv7.add_message("assistant",
        "IndexError means you're trying to access an index that doesn't exist in your "
        "list or array. Check: 1) Are you using the right range? 2) Is your loop counter correct? "
        "3) Did you handle empty lists? Can you share the specific code?")
    conversations.append(conv7)
    
    # 8. Recipe Request
    conv8 = Conversation(conversation_id="recipe_1")
    conv8.add_message("user", "Give me a simple pasta recipe")
    conv8.add_message("assistant",
        "Here's a simple aglio e olio recipe:\n"
        "Ingredients: pasta, garlic, olive oil, red pepper flakes, parsley\n"
        "1. Cook pasta\n2. Sauté garlic in olive oil\n3. Toss with pasta\n"
        "Simple, delicious, ready in 15 minutes!")
    conversations.append(conv8)
    
    # 9. History Question
    conv9 = Conversation(conversation_id="history_1")
    conv9.add_message("user", "Tell me about the Renaissance")
    conv9.add_message("assistant",
        "The Renaissance (14th-17th century) was a period of cultural rebirth in Europe. "
        "It saw revolutionary advances in art, science, and philosophy. Key figures include "
        "Leonardo da Vinci, Michelangelo, and Galileo. It marked the transition from medieval "
        "to modern thinking.")
    conversations.append(conv9)
    
    # 10. Career Advice
    conv10 = Conversation(conversation_id="career_1")
    conv10.add_message("user", "Should I learn machine learning or web development first?")
    conv10.add_message("assistant",
        "Both are valuable! Consider: Web development gives immediate practical skills and "
        "job opportunities. Machine learning is cutting-edge but requires strong math background. "
        "If you enjoy problem-solving and math, try ML. If you like building visible products, "
        "start with web dev. Many combine both skills!")
    conversations.append(conv10)
    
    # 11-20: Add more diverse conversations
    for i in range(11, 21):
        conv = Conversation(conversation_id=f"conv_{i}")
        topics = [
            ("Tell me a joke", "Why don't scientists trust atoms? Because they make up everything!"),
            ("What is machine learning?", "Machine learning is a subset of AI where algorithms learn patterns from data..."),
            ("How do I stay motivated?", "Set small goals, celebrate wins, and remember your why..."),
            ("Explain blockchain", "Blockchain is a distributed ledger technology that records transactions..."),
            ("Best practices for REST APIs", "Use proper HTTP methods, version your API, implement authentication..."),
            ("What is functional programming?", "Functional programming treats computation as evaluation of mathematical functions..."),
            ("How to improve communication skills?", "Practice active listening, be clear and concise, seek feedback..."),
            ("Explain neural networks", "Neural networks are computing systems inspired by biological neural networks..."),
            ("Tips for learning a new language", "Immerse yourself, practice daily, don't fear mistakes..."),
            ("What is cloud computing?", "Cloud computing delivers computing services over the internet...")
        ]
        topic = topics[(i - 11) % len(topics)]
        conv.add_message("user", topic[0])
        conv.add_message("assistant", topic[1])
        conversations.append(conv)
    
    return conversations


def run_demo():
    """Run the complete demonstration"""
    
    print("=" * 80)
    print("EmbeddingsSpace Visualization Platform - Demo")
    print("=" * 80)
    print()
    
    # Create output directory
    output_dir = "experiments/outputs"
    os.makedirs(output_dir, exist_ok=True)
    
    # Step 1: Create sample conversations
    print("Step 1: Creating sample conversations...")
    conversations = create_sample_conversations()
    print(f"Created {len(conversations)} sample conversations")
    print()
    
    # Step 2: Initialize components
    print("Step 2: Initializing components...")
    embedding_space = EmbeddingSpace()
    evaluator = LLMEvaluator()
    conv_manager = ConversationManager()
    
    for conv in conversations:
        conv_manager.add_conversation(conv)
    print("Components initialized")
    print()
    
    # Step 3: Compute embeddings
    print("Step 3: Computing embeddings...")
    for i, conv in enumerate(conversations):
        embedding_space.embed_conversation(conv)
        if (i + 1) % 5 == 0:
            print(f"  Embedded {i + 1}/{len(conversations)} conversations")
    print("All embeddings computed")
    print()
    
    # Step 4: Evaluate conversations
    print("Step 4: Evaluating conversations with LLM metrics...")
    metrics_to_evaluate = [
        EvaluationMetrics.COHERENCE,
        EvaluationMetrics.RELEVANCE,
        EvaluationMetrics.CREATIVITY,
        EvaluationMetrics.HELPFULNESS,
        EvaluationMetrics.ENGAGEMENT,
    ]
    
    for i, conv in enumerate(conversations):
        # Use mock evaluations for demo (set use_mock=False to use real API)
        for metric in metrics_to_evaluate:
            evaluator.evaluate_conversation(conv, metric, use_mock=True)
        
        if (i + 1) % 5 == 0:
            print(f"  Evaluated {i + 1}/{len(conversations)} conversations")
    print("All evaluations complete")
    print()
    
    # Print sample metrics
    print("Sample Metrics for first conversation:")
    print(f"  ID: {conversations[0].conversation_id}")
    for metric, value in conversations[0].metrics.items():
        print(f"  {metric}: {value:.2f}")
    print()
    
    # Step 5: Create visualizations
    print("Step 5: Creating visualizations...")
    
    # 5.1: Embedding space visualization (2D)
    print("  5.1: Creating embedding space visualizations...")
    embedding_viz = EmbeddingVisualizer(method='pca')
    
    # Basic embedding visualization
    fig1 = embedding_viz.visualize(conversations, n_components=2, title="Embedding Space (PCA)")
    embedding_viz.save_figure(fig1, f"{output_dir}/01_embedding_space_basic.png")
    plt.close(fig1)
    
    # Colored by coherence
    fig2 = embedding_viz.visualize(
        conversations, 
        color_by='coherence',
        n_components=2,
        title="Embedding Space - Colored by Coherence"
    )
    embedding_viz.save_figure(fig2, f"{output_dir}/02_embedding_coherence.png")
    plt.close(fig2)
    
    # Colored by creativity
    fig3 = embedding_viz.visualize(
        conversations,
        color_by='creativity',
        n_components=2,
        title="Embedding Space - Colored by Creativity"
    )
    embedding_viz.save_figure(fig3, f"{output_dir}/03_embedding_creativity.png")
    plt.close(fig3)
    
    # 3D visualization
    fig4 = embedding_viz.visualize(
        conversations,
        color_by='helpfulness',
        n_components=3,
        title="3D Embedding Space - Colored by Helpfulness"
    )
    embedding_viz.save_figure(fig4, f"{output_dir}/04_embedding_3d.png")
    plt.close(fig4)
    
    print("    Created embedding space visualizations")
    
    # 5.2: Metric landscape visualizations
    print("  5.2: Creating metric landscape visualizations...")
    landscape_viz = MetricLandscapeVisualizer()
    
    # Contour plot for coherence
    fig5 = landscape_viz.visualize_contour(
        conversations,
        'coherence',
        title="Coherence Landscape (Contour)"
    )
    landscape_viz.save_figure(fig5, f"{output_dir}/05_landscape_coherence_contour.png")
    plt.close(fig5)
    
    # 3D surface for creativity
    fig6 = landscape_viz.visualize_3d_surface(
        conversations,
        'creativity',
        title="Creativity Landscape (3D Surface)"
    )
    landscape_viz.save_figure(fig6, f"{output_dir}/06_landscape_creativity_3d.png")
    plt.close(fig6)
    
    # Peaks and valleys for engagement
    fig7 = landscape_viz.visualize_peaks_and_valleys(
        conversations,
        'engagement',
        title="Engagement: Peaks (Mountains) and Valleys"
    )
    landscape_viz.save_figure(fig7, f"{output_dir}/07_landscape_peaks_valleys.png")
    plt.close(fig7)
    
    print("    Created metric landscape visualizations")
    
    # 5.3: Self-Organizing Map visualizations
    print("  5.3: Creating SOM visualizations...")
    som_viz = SOMVisualizer(som_size=(10, 10))
    
    # Train SOM and create hit map
    embeddings = np.array([c.embedding for c in conversations if c.embedding is not None])
    som_viz.train_som(embeddings, num_iterations=1000)
    
    fig8 = som_viz.visualize(conversations, title="SOM: Hit Map")
    som_viz.save_figure(fig8, f"{output_dir}/08_som_hitmap.png")
    plt.close(fig8)
    
    # SOM with coherence metric
    fig9 = som_viz.visualize(
        conversations,
        metric_name='coherence',
        title="SOM: Coherence Interpolation"
    )
    som_viz.save_figure(fig9, f"{output_dir}/09_som_coherence.png")
    plt.close(fig9)
    
    # Multiple metrics in one figure
    fig10 = som_viz.visualize_multiple_metrics(
        conversations,
        metrics=['coherence', 'creativity', 'helpfulness', 'engagement']
    )
    som_viz.save_figure(fig10, f"{output_dir}/10_som_multiple_metrics.png")
    plt.close(fig10)
    
    print("    Created SOM visualizations")
    
    print()
    print("Step 6: Analyzing results...")
    
    # Find interesting regions
    print("\n  Finding interesting regions in embedding space:")
    
    # High coherence conversations
    high_coherence = conv_manager.filter_by_metric('coherence', 7.5, 'greater')
    print(f"  - {len(high_coherence)} conversations with coherence > 7.5")
    
    # High creativity conversations
    high_creativity = conv_manager.filter_by_metric('creativity', 7.5, 'greater')
    print(f"  - {len(high_creativity)} conversations with creativity > 7.5")
    
    # Find peaks and valleys in coherence landscape
    features = landscape_viz.find_peaks_and_valleys(conversations, 'coherence')
    print(f"  - Found {len(features['peaks'])} peaks (mountains) in coherence landscape")
    print(f"  - Found {len(features['valleys'])} valleys in coherence landscape")
    
    # Find interesting SOM regions
    interesting_regions = som_viz.find_regions_of_interest(
        conversations,
        'engagement',
        threshold=7.0,
        comparison='greater'
    )
    print(f"  - Found {len(interesting_regions)} high-engagement regions in SOM")
    
    print()
    
    # Step 7: Save conversation data
    print("Step 7: Saving conversation data...")
    conv_manager.save_to_json(f"{output_dir}/conversations_data.json")
    print(f"  Saved to {output_dir}/conversations_data.json")
    
    # Generate summary statistics
    print("\n" + "=" * 80)
    print("SUMMARY STATISTICS")
    print("=" * 80)
    print(f"Total conversations: {len(conversations)}")
    print(f"Embedding dimension: {len(conversations[0].embedding) if conversations[0].embedding else 'N/A'}")
    print()
    print("Metric Statistics:")
    for metric_name in ['coherence', 'relevance', 'creativity', 'helpfulness', 'engagement']:
        values = conv_manager.get_all_metrics(metric_name)
        if values:
            print(f"  {metric_name.capitalize():15s}: mean={np.mean(values):.2f}, std={np.std(values):.2f}, "
                  f"min={np.min(values):.2f}, max={np.max(values):.2f}")
    
    print()
    print("=" * 80)
    print("Demo complete! Check the experiments/outputs directory for visualizations.")
    print("=" * 80)


if __name__ == "__main__":
    run_demo()
