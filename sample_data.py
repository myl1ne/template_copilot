"""
Sample data for the Company Understanding Platform
"""

import random
from datetime import datetime, timedelta

def get_sample_ontology(dataset_name):
    """Get sample ontology data based on dataset selection"""
    
    ontologies = {
        "Tech Company": {
            "entity_type": "Organization",
            "description": "Tech Company Root - Extracted from 10,000+ emails",
            "children": [
                {
                    "entity_type": "Engineering Department",
                    "description": "Software development and technical infrastructure teams",
                    "children": [
                        {
                            "entity_type": "Backend Team",
                            "description": "Server-side development, APIs, and database management",
                            "children": [
                                {
                                    "entity_type": "API Development",
                                    "description": "RESTful and GraphQL API design and implementation",
                                    "children": []
                                },
                                {
                                    "entity_type": "Database Management",
                                    "description": "Database design, optimization, and maintenance",
                                    "children": []
                                }
                            ]
                        },
                        {
                            "entity_type": "Frontend Team",
                            "description": "User interface and client-side application development",
                            "children": [
                                {
                                    "entity_type": "Web Applications",
                                    "description": "React and Vue.js web application development",
                                    "children": []
                                },
                                {
                                    "entity_type": "Mobile Development",
                                    "description": "iOS and Android native application development",
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "entity_type": "Product Management",
                    "description": "Product strategy, roadmap, and feature prioritization",
                    "children": [
                        {
                            "entity_type": "Product Strategy",
                            "description": "Long-term product vision and market positioning",
                            "children": []
                        },
                        {
                            "entity_type": "User Research",
                            "description": "Customer interviews, surveys, and usability testing",
                            "children": []
                        }
                    ]
                },
                {
                    "entity_type": "Business Operations",
                    "description": "Sales, marketing, and customer success operations",
                    "children": [
                        {
                            "entity_type": "Sales Team",
                            "description": "Revenue generation and customer acquisition",
                            "children": []
                        },
                        {
                            "entity_type": "Marketing",
                            "description": "Brand awareness and lead generation",
                            "children": []
                        }
                    ]
                }
            ]
        },
        "Marketing Department": {
            "entity_type": "Marketing Department",
            "description": "Marketing organization extracted from departmental emails",
            "children": [
                {
                    "entity_type": "Content Creation",
                    "description": "Content strategy and production workflows",
                    "children": [
                        {
                            "entity_type": "Blog Management",
                            "description": "Editorial calendar and blog post production",
                            "children": []
                        },
                        {
                            "entity_type": "Video Production",
                            "description": "Video content creation and editing",
                            "children": []
                        }
                    ]
                },
                {
                    "entity_type": "Campaigns",
                    "description": "Marketing campaign planning and execution",
                    "children": [
                        {
                            "entity_type": "Email Campaigns",
                            "description": "Email marketing automation and newsletters",
                            "children": []
                        },
                        {
                            "entity_type": "Event Marketing",
                            "description": "Conference participation and webinar hosting",
                            "children": []
                        }
                    ]
                }
            ]
        },
        "Enterprise Organization": {
            "entity_type": "Enterprise",
            "description": "Large enterprise organization structure",
            "children": [
                {
                    "entity_type": "Regional Offices",
                    "description": "Geographic distribution of office locations",
                    "children": [
                        {
                            "entity_type": "North America",
                            "description": "US and Canada operations",
                            "children": []
                        },
                        {
                            "entity_type": "Europe",
                            "description": "European operations",
                            "children": []
                        },
                        {
                            "entity_type": "Asia Pacific",
                            "description": "APAC region operations",
                            "children": []
                        }
                    ]
                },
                {
                    "entity_type": "Corporate Functions",
                    "description": "Central corporate services",
                    "children": [
                        {
                            "entity_type": "Human Resources",
                            "description": "Talent management and employee relations",
                            "children": []
                        },
                        {
                            "entity_type": "Finance",
                            "description": "Financial planning and accounting",
                            "children": []
                        }
                    ]
                }
            ]
        }
    }
    
    return ontologies.get(dataset_name, ontologies["Tech Company"])


def get_sample_entities(dataset_name):
    """Generate sample entity data with spatiotemporal information"""
    
    # Sample locations (lat, lon)
    locations = {
        "New York": (40.7128, -74.0060),
        "San Francisco": (37.7749, -122.4194),
        "London": (51.5074, -0.1278),
        "Tokyo": (35.6762, 139.6503),
        "Singapore": (1.3521, 103.8198),
        "Paris": (48.8566, 2.3522),
        "Berlin": (52.5200, 13.4050),
        "Sydney": (-33.8688, 151.2093),
        "Toronto": (43.6532, -79.3832),
        "Mumbai": (19.0760, 72.8777)
    }
    
    entity_types = [
        "Person", "Organization", "Department", "Project", 
        "Product", "Location", "Event", "Technology"
    ]
    
    # Generate sample entities
    entities = []
    base_date = datetime.now() - timedelta(days=180)
    
    for i in range(50):
        location_name = random.choice(list(locations.keys()))
        lat, lon = locations[location_name]
        
        # Add some random variation to coordinates
        lat += random.uniform(-0.1, 0.1)
        lon += random.uniform(-0.1, 0.1)
        
        entity = {
            "email_id": f"email_{i:04d}",
            "detected_entities": [
                {
                    "entity_text": f"Entity_{i}",
                    "entity_type": random.choice(entity_types),
                    "entity_instance": f"entity_{i}",
                    "location": location_name,
                    "latitude": lat,
                    "longitude": lon,
                    "timestamp": (base_date + timedelta(days=random.randint(0, 180))).isoformat(),
                    "confidence": round(random.uniform(0.7, 1.0), 2)
                }
            ]
        }
        
        # Some emails have multiple entities
        if random.random() > 0.6:
            entity["detected_entities"].append({
                "entity_text": f"Entity_{i}_related",
                "entity_type": random.choice(entity_types),
                "entity_instance": f"entity_{i}_related",
                "location": location_name,
                "latitude": lat,
                "longitude": lon,
                "timestamp": (base_date + timedelta(days=random.randint(0, 180))).isoformat(),
                "confidence": round(random.uniform(0.7, 1.0), 2)
            })
        
        entities.append(entity)
    
    return entities
