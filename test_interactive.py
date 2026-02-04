"""
Test script to verify the interactive app components
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from embeddings_space.core.conversation import Conversation
from embeddings_space.core.embeddings import EmbeddingSpace
from embeddings_space.audit.llm_evaluator import LLMEvaluator, EvaluationMetrics
from embeddings_space.visualizers.interactive_viz import InteractiveEmbeddingVisualizer

print("Testing interactive visualization components...")

# Create sample conversations
conversations = []
topics = [
    ("AI Ethics", "What are AI ethics concerns?", "AI ethics involves..."),
    ("Quantum Computing", "Explain quantum computing", "Quantum computers use..."),
    ("Climate Change", "How can we address climate change?", "Climate action requires..."),
]

for i, (title, user_msg, asst_msg) in enumerate(topics):
    conv = Conversation(conversation_id=f"test_{i}")
    conv.metadata['title'] = title
    conv.add_message("user", user_msg)
    conv.add_message("assistant", asst_msg)
    conversations.append(conv)

print(f"✅ Created {len(conversations)} sample conversations")

# Compute embeddings
embedding_space = EmbeddingSpace()
for conv in conversations:
    embedding_space.embed_conversation(conv)

print("✅ Computed embeddings")

# Evaluate
evaluator = LLMEvaluator()
for conv in conversations:
    for metric in [EvaluationMetrics.COHERENCE, EvaluationMetrics.CREATIVITY]:
        evaluator.evaluate_conversation(conv, metric, use_mock=True)

print("✅ Evaluated conversations")

# Create interactive visualization
viz = InteractiveEmbeddingVisualizer(method='pca')
fig = viz.create_2d_plot(
    conversations,
    color_by='coherence',
    hover_data=['preview']
)

print("✅ Created interactive 2D plot")

# Save to HTML
fig.write_html("/tmp/interactive_viz_test.html")
print("✅ Saved interactive plot to /tmp/interactive_viz_test.html")

# Create 3D visualization
fig_3d = viz.create_3d_plot(conversations, color_by='creativity')
fig_3d.write_html("/tmp/interactive_3d_test.html")
print("✅ Saved interactive 3D plot to /tmp/interactive_3d_test.html")

print("\n✅ All interactive visualization tests passed!")
print("\nTo run the full app:")
print("  streamlit run app.py")
