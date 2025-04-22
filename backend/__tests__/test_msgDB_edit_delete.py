import pytest
from src.MessageDB.msgDB import (
    init_db_for_testing,
    add_message,
    edit_message,
    delete_message,
    get_message_by_id,
)
###############################
#       RUN CODE WITH         
# PYTHONPATH=backend pytest backend/__tests__/test_msgDB_edit_delete.py
#
###############################

@pytest.fixture(autouse=True)
def setup_and_teardown():
    # Setup before each test
    init_db_for_testing()
    yield
    # Teardown: Clear all messages after each test
    from src.MessageDB.msgDB import delete_all_messages
    delete_all_messages()

def test_edit_message():
    message_id = "test123"
    add_message(message_id, "2025-04-17", "user1", "Original text", "general")

    # Edit the message
    new_text = "Updated text"
    edit_message(message_id, new_text)
    message = get_message_by_id(message_id)

    assert message is not None
    assert message["text"] == new_text

def test_delete_message():
    message_id = "test456"
    add_message(message_id, "2025-04-17", "user2", "This will be deleted", "general")

    # Delete the message
    delete_message(message_id)
    message = get_message_by_id(message_id)

    assert message is None


# Example run of code

#fibersync % PYTHONPATH=backend pytest backend/__tests__/test_msgDB_edit_delete.py
#======================================================================================== test session starts =========================================================================================
#platform darwin -- Python 3.13.2, pytest-8.3.5, pluggy-1.5.0
#collected 2 items                                                                                                                                                                                    

#backend/__tests__/test_msgDB_edit_delete.py ..                                                                                                                                                 [100%]

#========================================================================================= 2 passed in 1.57s ==========================================================================================
