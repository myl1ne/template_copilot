from setuptools import setup, find_packages

setup(
    name="embeddings-space",
    version="0.1.0",
    description="Experimental visualization platform for conversation embeddings",
    author="Copilot Team",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.8",
    install_requires=[
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "scikit-learn>=1.3.0",
        "umap-learn>=0.5.5",
        "minisom>=2.3.1",
        "matplotlib>=3.7.0",
        "plotly>=5.18.0",
        "seaborn>=0.13.0",
        "openai>=1.12.0",
        "python-dotenv>=1.0.0",
        "tqdm>=4.66.0",
    ],
)
