import requests
import sys
import json
import base64
from datetime import datetime
import os

class SalahReminderAPITester:
    def __init__(self, base_url="https://mosque-connect-11.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.superadmin_user = None
        self.admin_user = None
        self.regular_user = None
        self.mosque_id = None
        self.admin_id = None
        self.post_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} - {name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, params=None, use_form=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                if files is not None or use_form:
                    response = requests.post(url, data=data, files=files, headers=headers, timeout=10)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                headers['Content-Type'] = 'application/json'
                response = requests.patch(url, json=data, headers=headers, params=params, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected {expected_status})"
                try:
                    error_data = response.json()
                    details += f" | Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" | Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_get_mosques(self):
        """Test getting mosques list"""
        success, response = self.run_test(
            "Get Mosques",
            "GET", 
            "mosques",
            200
        )
        if success and response:
            if len(response) > 0:
                self.mosque_id = response[0]['id']
                self.log_test("Mosque ID Retrieved", True, f"ID: {self.mosque_id}")
            else:
                self.log_test("Mosque Data Check", False, "No mosques found in database")
        return success

    def test_get_single_mosque(self):
        """Test getting single mosque"""
        if not self.mosque_id:
            self.log_test("Get Single Mosque", False, "No mosque ID available")
            return False
            
        success, response = self.run_test(
            "Get Single Mosque",
            "GET",
            f"mosques/{self.mosque_id}",
            200
        )
        return success

    def test_superadmin_login(self):
        """Test superadmin login"""
        success, response = self.run_test(
            "Superadmin Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "superadmin@salah.com",
                "password": "superadmin123"
            }
        )
        if success:
            self.superadmin_user = response
        return success

    def test_regular_user_registration(self):
        """Test regular user registration"""
        # Use form data as required by the endpoint
        data = {
            'email': f"testuser_{datetime.now().strftime('%H%M%S')}@test.com",
            'password': 'testpass123',
            'role': 'user'
        }
        
        success, response = self.run_test(
            "Regular User Registration",
            "POST",
            "auth/register",
            200,
            data=data,
            use_form=True
        )
        if success:
            self.regular_user = response
        return success

    def test_admin_registration(self):
        """Test admin registration with ID proof"""
        # Create a dummy image file for ID proof
        dummy_image = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")
        
        try:
            # Use form data for file upload
            files = {'id_proof': ('test_id.png', dummy_image, 'image/png')}
            data = {
                'email': f"testadmin_{datetime.now().strftime('%H%M%S')}@test.com",
                'password': 'testpass123',
                'role': 'admin',
                'mosque_id': self.mosque_id
            }
            
            success, response = self.run_test(
                "Admin Registration",
                "POST",
                "auth/register",
                200,
                data=data,
                files=files
            )
            if success:
                self.admin_user = response
                self.admin_id = response['id']
            return success
        except Exception as e:
            self.log_test("Admin Registration", False, f"Exception: {str(e)}")
            return False

    def test_get_pending_admins(self):
        """Test getting pending admin registrations"""
        success, response = self.run_test(
            "Get Pending Admins",
            "GET",
            "users/pending",
            200
        )
        return success

    def test_approve_admin(self):
        """Test approving admin registration"""
        if not self.admin_id:
            self.log_test("Approve Admin", False, "No admin ID available")
            return False
            
        success, response = self.run_test(
            "Approve Admin",
            "PATCH",
            f"users/{self.admin_id}/status",
            200,
            params={"status": "approved"}
        )
        return success

    def test_admin_login(self):
        """Test admin login after approval"""
        if not self.admin_user:
            self.log_test("Admin Login", False, "No admin user available")
            return False
            
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.admin_user['email'],
                "password": "testpass123"
            }
        )
        return success

    def test_prayer_times_api(self):
        """Test prayer times from Aladhan API"""
        if not self.mosque_id:
            self.log_test("Prayer Times API", False, "No mosque ID available")
            return False
            
        today = datetime.now().strftime('%Y-%m-%d')
        success, response = self.run_test(
            "Prayer Times API",
            "GET",
            f"prayer-times/{self.mosque_id}",
            200,
            params={"date": today}
        )
        return success

    def test_set_manual_prayer_times(self):
        """Test setting manual prayer times"""
        if not self.mosque_id:
            self.log_test("Set Manual Prayer Times", False, "No mosque ID available")
            return False
            
        today = datetime.now().strftime('%Y-%m-%d')
        success, response = self.run_test(
            "Set Manual Prayer Times",
            "POST",
            "prayer-times",
            200,
            data={
                "mosque_id": self.mosque_id,
                "date": today,
                "fajr": "05:30",
                "dhuhr": "12:30",
                "asr": "15:30",
                "maghrib": "18:30",
                "isha": "20:00"
            }
        )
        return success

    def test_create_post(self):
        """Test creating a community post"""
        if not self.admin_id or not self.mosque_id:
            self.log_test("Create Post", False, "No admin ID or mosque ID available")
            return False
            
        success, response = self.run_test(
            "Create Post",
            "POST",
            f"posts?admin_id={self.admin_id}&mosque_id={self.mosque_id}",
            200,
            data={
                "title": "Test Community Post",
                "content": "This is a test post for the community feed."
            }
        )
        if success:
            self.post_id = response.get('id')
        return success

    def test_get_pending_posts(self):
        """Test getting pending posts"""
        success, response = self.run_test(
            "Get Pending Posts",
            "GET",
            "posts/pending",
            200
        )
        return success

    def test_approve_post(self):
        """Test approving a post"""
        if not self.post_id:
            self.log_test("Approve Post", False, "No post ID available")
            return False
            
        success, response = self.run_test(
            "Approve Post",
            "PATCH",
            f"posts/{self.post_id}/status",
            200,
            data={"status": "approved"}
        )
        return success

    def test_get_approved_posts(self):
        """Test getting approved posts for mosque"""
        if not self.mosque_id:
            self.log_test("Get Approved Posts", False, "No mosque ID available")
            return False
            
        success, response = self.run_test(
            "Get Approved Posts",
            "GET",
            "posts",
            200,
            params={"mosque_id": self.mosque_id, "status": "approved"}
        )
        return success

    def test_upload_donation_qr(self):
        """Test uploading donation QR code"""
        if not self.mosque_id:
            self.log_test("Upload Donation QR", False, "No mosque ID available")
            return False
            
        # Create a dummy QR code image
        dummy_qr = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")
        
        try:
            files = {'file': ('qr_code.png', dummy_qr, 'image/png')}
            success, response = self.run_test(
                "Upload Donation QR",
                "POST",
                f"mosques/{self.mosque_id}/donation-qr",
                200,
                files=files
            )
            return success
        except Exception as e:
            self.log_test("Upload Donation QR", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Salah Reminder API Tests")
        print("=" * 50)
        
        # Basic API tests
        self.test_root_endpoint()
        self.test_get_mosques()
        self.test_get_single_mosque()
        
        # Authentication tests
        self.test_superadmin_login()
        self.test_regular_user_registration()
        self.test_admin_registration()
        
        # Admin approval workflow
        self.test_get_pending_admins()
        self.test_approve_admin()
        self.test_admin_login()
        
        # Prayer times tests
        self.test_prayer_times_api()
        self.test_set_manual_prayer_times()
        
        # Posts workflow
        self.test_create_post()
        self.test_get_pending_posts()
        self.test_approve_post()
        self.test_get_approved_posts()
        
        # File upload tests
        self.test_upload_donation_qr()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = SalahReminderAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())