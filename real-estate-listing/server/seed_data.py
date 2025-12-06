"""
Script to seed the database with sample properties and realtors for testing
"""
from app import create_app
from app.extensions import db
from app.models.property import Property
from app.models.realtor import Realtor
import uuid

app = create_app()

def seed_database():
    with app.app_context():
        # Check if we already have data
        existing_realtors = Realtor.query.count()
        existing_properties = Property.query.count()
        
        if existing_realtors > 0 or existing_properties > 0:
            print(f"Database already has {existing_realtors} realtors and {existing_properties} properties.")
            response = input("Do you want to add more test data? (y/n): ")
            if response.lower() != 'y':
                print("Skipping seed.")
                return
        
        # Create a test realtor
        test_realtor_id = str(uuid.uuid4())
        test_realtor = Realtor(
            id=test_realtor_id,
            realtor_id="test-user-123",
            company_name="Premium Real Estate Group",
            description="Leading real estate agency specializing in commercial and residential properties.",
            profile_picture="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop",
            company_mail="info@premiumrealestate.com",
            website_url="https://premiumrealestate.com",
            contact="+1-555-0100",
            active=True
        )
        
        db.session.add(test_realtor)
        db.session.commit()
        print(f"✓ Created realtor: {test_realtor.company_name}")
        
        # Sample properties data
        sample_properties = [
            {
                "address": "Space Rental",
                "location": "Newton, IA",
                "description": "Prime self-storage facility located in Newton, IA. This well-maintained property offers 320 units across 7.93 acres. Ideal for investors seeking a stable income-producing asset in a growing market.",
                "bedrooms": 320,
                "bathrooms": 2,
                "category": "Traditional Site",
                "price": 2500000.0,
                "property_type": "Commercial",
                "size": "7.93 acres",
                "property_images": [
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                ]
            },
            {
                "address": "Blue Water Storage - Paris",
                "location": "Paris, TX",
                "description": "Established storage facility in Paris, TX with 335 units. Property features excellent visibility and easy access. Strong tenant base and consistent revenue stream.",
                "bedrooms": 335,
                "bathrooms": 2,
                "category": "Traditional Site",
                "price": 2300000.0,
                "property_type": "Commercial",
                "size": "5.07 acres",
                "property_images": [
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1974&auto=format&fit=crop"
                ]
            },
            {
                "address": "Inside the Box Self Storage",
                "location": "Monroe, LA",
                "description": "Smaller facility with great potential for expansion. Currently operating with 156 units on 8.52 acres. Perfect opportunity for first-time investors or experienced operators looking to expand their portfolio.",
                "bedrooms": 156,
                "bathrooms": 1,
                "category": "Traditional Site",
                "price": 575000.0,
                "property_type": "Commercial",
                "size": "8.52 acres",
                "property_images": [
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1974&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop"
                ]
            },
            {
                "address": "Metro Storage Facility",
                "location": "Dallas, TX",
                "description": "Modern storage facility in the heart of Dallas. Features state-of-the-art security systems and climate-controlled units. High occupancy rate and excellent location.",
                "bedrooms": 285,
                "bathrooms": 3,
                "category": "Traditional Site",
                "price": 1850000.0,
                "property_type": "Commercial",
                "size": "6.25 acres",
                "property_images": [
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                ]
            },
            {
                "address": "Industrial Flex Space",
                "location": "Houston, TX",
                "description": "Large industrial flex space perfect for warehousing and distribution. Located in prime industrial district with excellent highway access. Zoned for multiple uses.",
                "bedrooms": 450,
                "bathrooms": 4,
                "category": "Traditional Site",
                "price": 3200000.0,
                "property_type": "Industrial",
                "size": "12.5 acres",
                "property_images": [
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1974&auto=format&fit=crop"
                ]
            },
            {
                "address": "Warehouse District Units",
                "location": "Atlanta, GA",
                "description": "Prime warehouse space in Atlanta's growing warehouse district. Recently renovated with modern amenities. Great investment opportunity.",
                "bedrooms": 195,
                "bathrooms": 2,
                "category": "Traditional Site",
                "price": 1250000.0,
                "property_type": "Warehouse",
                "size": "4.8 acres",
                "property_images": [
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1974&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop"
                ]
            }
        ]
        
        # Create properties
        created_count = 0
        for prop_data in sample_properties:
            new_property = Property(
                id=str(uuid.uuid4()),
                owner_id=test_realtor_id,
                location=prop_data["location"],
                description=prop_data["description"],
                address=prop_data["address"],
                bedrooms=prop_data["bedrooms"],
                bathrooms=prop_data["bathrooms"],
                category=prop_data["category"],
                price=prop_data["price"],
                property_type=prop_data["property_type"],
                size=prop_data["size"],
                property_images=prop_data["property_images"],
                active=True
            )
            
            db.session.add(new_property)
            created_count += 1
        
        db.session.commit()
        print(f"✓ Created {created_count} properties")
        print(f"\n✅ Database seeded successfully!")
        print(f"   - 1 realtor")
        print(f"   - {created_count} properties")
        print(f"\nYou can now view the properties in your frontend!")

if __name__ == '__main__':
    seed_database()



