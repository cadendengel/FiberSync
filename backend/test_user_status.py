from unittest.mock import patch
from user_status import get_user_status_by_username


### use "pytest -s backend/test_user_status.py" to test using termianl ###

def test_get_user_status():
    with patch('user_status.db') as mock_db:
        # Setup mock data: return 'online' status for 'test_user'
        mock_db.users.find_one.return_value = {'username': 'test_user', 'status': 'online'}
        
        # Call the function and assert that the status is 'online'
        status = get_user_status_by_username('test_user')
        print(f"Status for 'test_user': {status}")  # Print the status
        assert status == 'online'

        # Test the case where the user doesn't exist
        mock_db.users.find_one.return_value = None
        status = get_user_status_by_username('nonexistent_user')
        print(f"Status for 'nonexistent_user': {status}")  # Print the status
        assert status is None
        
        # Test for 'offline' user
        mock_db.users.find_one.return_value = {'username': 'test_user_offline', 'status': 'offline'}
        status = get_user_status_by_username('test_user_offline')
        print(f"Status for 'test_user_offline': {status}")  # Print the status
        assert status == 'offline'

        
