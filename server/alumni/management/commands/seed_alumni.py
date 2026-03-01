from django.core.management.base import BaseCommand
from alumni.models import Alumni


SEED_DATA = [
    {'name': 'Ankit Verma', 'email': 'ankit.verma@alumni.edu', 'role': 'SDE-2', 'company': 'Google', 'batch': '2020', 'department': 'CS', 'location': 'Bangalore', 'experience': '4 yrs', 'industry': 'Technology', 'skills': ['React', 'Go', 'K8s'], 'available': True, 'linkedin': 'https://linkedin.com/in/ankitverma'},
    {'name': 'Priya Singh', 'email': 'priya.singh@alumni.edu', 'role': 'Product Manager', 'company': 'Microsoft', 'batch': '2019', 'department': 'CS', 'location': 'Hyderabad', 'experience': '5 yrs', 'industry': 'Technology', 'skills': ['Agile', 'Data', 'Strategy'], 'available': True, 'linkedin': 'https://linkedin.com/in/priyasingh'},
    {'name': 'Rohit Mehta', 'email': 'rohit.mehta@alumni.edu', 'role': 'Data Scientist', 'company': 'Amazon', 'batch': '2021', 'department': 'IT', 'location': 'Bangalore', 'experience': '3 yrs', 'industry': 'Technology', 'skills': ['Python', 'ML', 'SQL'], 'available': False, 'linkedin': 'https://linkedin.com/in/rohitmehta'},
    {'name': 'Sneha Patel', 'email': 'sneha.patel@alumni.edu', 'role': 'UX Designer', 'company': 'Flipkart', 'batch': '2020', 'department': 'CS', 'location': 'Bangalore', 'experience': '4 yrs', 'industry': 'E-Commerce', 'skills': ['Figma', 'Research', 'Design'], 'available': True, 'linkedin': 'https://linkedin.com/in/snehapatel'},
    {'name': 'Vikram Joshi', 'email': 'vikram.joshi@alumni.edu', 'role': 'DevOps Engineer', 'company': 'Netflix', 'batch': '2018', 'department': 'CS', 'location': 'Remote', 'experience': '6 yrs', 'industry': 'Entertainment', 'skills': ['AWS', 'Docker', 'CI/CD'], 'available': True, 'linkedin': 'https://linkedin.com/in/vikramjoshi'},
    {'name': 'Meera Reddy', 'email': 'meera.reddy@alumni.edu', 'role': 'ML Engineer', 'company': 'Meta', 'batch': '2019', 'department': 'ECE', 'location': 'Menlo Park', 'experience': '5 yrs', 'industry': 'Technology', 'skills': ['PyTorch', 'NLP', 'CV'], 'available': False, 'linkedin': 'https://linkedin.com/in/meerareddy'},
    {'name': 'Arjun Nair', 'email': 'arjun.nair@alumni.edu', 'role': 'Consultant', 'company': 'McKinsey', 'batch': '2017', 'department': 'MBA', 'location': 'Mumbai', 'experience': '7 yrs', 'industry': 'Consulting', 'skills': ['Strategy', 'Analytics', 'Leadership'], 'available': True, 'linkedin': 'https://linkedin.com/in/arjunnair'},
    {'name': 'Kavita Sharma', 'email': 'kavita.sharma@alumni.edu', 'role': 'Backend Engineer', 'company': 'Razorpay', 'batch': '2021', 'department': 'CS', 'location': 'Bangalore', 'experience': '3 yrs', 'industry': 'FinTech', 'skills': ['Node.js', 'PostgreSQL', 'Redis'], 'available': True, 'linkedin': 'https://linkedin.com/in/kavitasharma'},
    {'name': 'Deepak Gupta', 'email': 'deepak.gupta@alumni.edu', 'role': 'CTO', 'company': 'HealthTech Startup', 'batch': '2016', 'department': 'IT', 'location': 'Delhi', 'experience': '8 yrs', 'industry': 'Healthcare', 'skills': ['Architecture', 'Cloud', 'Team Lead'], 'available': False, 'linkedin': 'https://linkedin.com/in/deepakgupta'},
]


class Command(BaseCommand):
    help = 'Seed the database with sample alumni data'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data before seeding')

    def handle(self, *args, **options):
        if options['clear']:
            count = Alumni.objects.count()
            Alumni.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {count} existing alumni records'))

        created = 0
        for data in SEED_DATA:
            _, was_created = Alumni.objects.get_or_create(
                email=data['email'],
                defaults=data,
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Seeded {created} alumni records ({Alumni.objects.count()} total)'))
