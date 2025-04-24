# FiberSync
Fibersync is a social messaging service designed to be safe, user-friendly, and professional.
https://fibersync-fd2e2.web.app/


## Table of Contents
* [General Info](#general-information)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Screenshots](#screenshots)
* [Project Status](#project-status)
* [Room for Improvement](#room-for-improvement)
* [Acknowledgements](#acknowledgements)


## General Information

We are a team of programmers called the Changelings (Chris Clark, Caden Dengel, and Ricky Mosqueda-Torres) 
working together to create a privately hosted messaging application so that students, professionals, and recreational users 
can utilize a platform that accounts for their working environment and prioritizes their data and privacy.


## Technologies Used
*	<a href="https://flask.palletsprojects.com/en/stable/">Flask</a> - Backend web Framework for API
*	<a href="https://www.python.org/">Python</a> - Primary backend Programming Language
*	<a href="https://react.dev/">React</a> - Frontend UI
*   <a href="https://axios-http.com/docs/api_intro/">Axios</a> - Axios calls to connect frontend to backend
*   <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/">Websockets</a> - Realtime user-to-user communication
*	Database
	*	<a href="https://www.mongodb.com/">MongoDB</a> - Flexible document-based database
*	Deployment
	* <a href="https://www.render.com/">Render</a> - Hosting Backend
	* <a href="https://firebase.google.com/">Firebase</a> - Hosting Frontend


## Features
Sprint 3:
* Move relevant features over from axios calls to websocket communication for realtime updates 
* Add profile features for a more user-friendly experience
* Add a developer mode for testing and moderation
* Update UI and css structure to be more developer/SOLID-friendly and modernize the frontend

Contributions:

Clark: I worked on improving the structure and user experience of the frontend interface. This included modularizing CSS into component-specific files, implementing real-time WebSocket-based direct messaging (eventually via an invite system) and SA16 testing and results documentation on the frontend.

* Jira Task: Update Direct Message UI
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-100"> SCRUM-100</a>
* Jira Task: Implement Real-Time Direct Messaging Functionality
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-101"> SCRUM-101</a>
* Jira Task: Add Real-Time Notification for Beginning DMs
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-102"> SCRUM-102</a>
* Jira Task: Handle DM Session Closure and Conditional Deletion
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-103"> SCRUM-103</a>
* Jira Task: Write Frontend Unit Tests for WebSocket DM Logic
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-106"> SCRUM-106</a>
* Jira Task: Modernize the Frontend UI
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-108"> SCRUM-108</a>
* Jira Task: Chris - SA16 Testing Plan
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-117"> SCRUM-117</a>
* Jira Task: Chris - SA16 Test Execution and Results
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-119"> SCRUM-119</a>

Caden: I worked on backend and frontend enhancements including developer mode routes,
 websocket-based real-time updates, reaction testing, and profile data integration,
 along with database schema updates and comprehensive SA16 testing and results documentation.
 
* Jira Task: Implement backend routes to handle developer mode actions
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-92"> SCRUM-92</a>
* Jira Task: Write tests for reaction storage, retrieval, and UI updates.
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-99"> SCRUM-99</a>
* Jira Task: Reimplement Realtime User Status Frontend Updates via Websockets
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-104"> SCRUM-104</a>
* Jira Task: Reimplement Realtime Channel Frontend Updates via Websockets
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-105"> SCRUM-105</a>
* Jira Task: Implement Account Creation Timestamp and User Description Fields in Database
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-110"> SCRUM-110</a>
* Jira Task: Link Database to Profile Popup via API Call
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-111"> SCRUM-111</a>
* Jira Task: Caden - SA16 Testing Plan
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-116"> SCRUM-116</a>
* Jira Task: Caden - SA16 Test Execution and Results
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-120"> SCRUM-120</a>
	
Ricky: I worked on UI improvements, added key features like the Developer Mode toggle and destructive action confirmations, implemented and tested message/user deletion, and helped design and test user profile functionalities.

* Jira Task: Add Scrollbar to UserSidebar
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-107"> SCRUM-107</a>
* Jira Task: Create a Hidden UI toggle or Login Feature to activate Developer Mode
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-88"> SCRUM-88</a>
* Jira Task: Implement a "Delete All Messages" button to clear chat history
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-89"> SCRUM-89</a>
* Jira Task: Ricky - SA16 Testing Plan
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-118"> SCRUM-118</a>
* Jira Task: Ricky - SA16 Test Execution and Results
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-121"> SCRUM-121</a>
* Jira Task: Implement a "Delete User" button to remove a User from DB
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-90"> SCRUM-90</a>
* Jira Task: Add confirmation prompts for destructive operations
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-91"> SCRUM-91</a>
* Jira Task: Design UI for User Profile Popup
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-109"> SCRUM-109</a>
* Jira Task: Write tests to verify editing and deletion functionality
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-62"> SCRUM-62</a>


Sprint 2: For our second sprint, we aimed to expand upon the foundation established in Sprint 1 by refining existing features and adding new functionality. Our goals included:
* Enhancing real-time messaging functionality with better UI/UX improvements.
* Implementing User Status features
* Improving backend integration with optimized API responses.
* Ensuring seamless switching between chat channels.
* Strengthening automated testing with integration tests.

Contributions:
Clark: I focused on integrating the first steps to direct messaging, channel features and ultimately ensuring real-time messaging and managed to deploy the backend to a Live server.

* Jira Task: Implement Backend for Real-Time Communication
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-16"> SCRUM-16</a>
* Jira Task: Integrate Chat Box with Direct Message Feature
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-17"> SCRUM-17</a>
* Jira Task: Update the sidebar that lists available channels
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-73"> SCRUM-73</a>
* Jira Task: Implement channel switching logic on the frontend
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-74"> SCRUM-74</a>
* Jira Task: Update backend to return channel-specific messages
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-75"> SCRUM-75</a>
* Jira Task: Ensure the active channel is visually highlighted in the UI
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-76"> SCRUM-76</a>
* Jira Task: Write integration tests to verify channel switching and message loading
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-77"> SCRUM-77</a>

Caden: Completed tasks include implementing secure session management, user authentication, frontend login/signup forms with validation, error handling,
and dynamic message handling, while also ensuring secure password storage, user details display, and real-time updates.

* Implement secure session management: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-55"> SCRUM-55</a>
* Store authentication tokens: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-56"> SCRUM-56</a>
* Modify UI to show logged-in user details when loading in: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-57"> SCRUM-57</a>
* Write security tests to ensure proper session handling: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-58"> SCRUM-58</a>
* Implement Authentication for user sign-up and sign-in: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-68"> SCRUM-68</a>
* Create login and signup pages in the frontend with form validation: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-69"> SCRUM-69</a>
* Ensures passwords are stored: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-70"> SCRUM-70</a>
* Implement error handling for failed login attempts: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-71"> SCRUM-71</a>
* Write unit tests for authentication function: 
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-72"> SCRUM-72</a>

Additional Tasks I, Caden, Assumed Responsibility of:
* Implement backend routes to handle message edits and deletions:
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-60"> SCRUM-60</a>
* Ensure frontend updates message content dynmically after an edit:
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-61"> SCRUM-61</a>
* Modify the UI to display real-time user status updates:
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-65"> SCRUM-65</a>
* Implement automatic reconnection handling for lost connections:
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-66"> SCRUM-66</a>
	
Ricky: I focused on the frontend/UI of the website, ensuring that it adapts to different screen sizes. Additionally, I worked on linking reactions to the database.

* Jira Task: Implement backend routes to add and remove reactions.
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-98"> SCRUM-98</a>
* Jira Task: Design and implement a UI for selecting emoji reactions on messages.
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-97"> SCRUM-97</a>
* Jira Task: Adjust the layout to properly support responsiveness
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-80"> SCRUM-80</a>
* Jira Task: Ensure the chat input box stays fixed at the bottom of the page (for mobile)
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-79"> SCRUM-79</a>
* Jira Task: Improve chat message styling
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-78"> SCRUM-78</a>


Sprint 1: For our first sprint we hoped to lay out the groundwork for the project by developing the following features:
* A website that multiple users can connect to from different devices
* A real time messaging channel with scrolling functionality that any user with a name can post to
* Online users section that displays connected users in real time

Contributions:
Clark: Built off of a REACT framework to develop the frontend UI, deployed the REACT App through Firebase, implemented a bitbucket pipeline for auto deployment and
designed a temporarily functioning Frontend with components that designate: channels, chat window, chat input, and users. Created temporary Unit tests based off
the REACT components, to be modified with the functioning backend and implement Integration tests.

* Jira Task: Deploy Frontend to a Public URL
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-35"> SCRUM-35</a>
* Jira Task: Implement a CI/CD Pipeline for Automated Deployment
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-36"> SCRUM-36</a>
* Jira Task: Design the Primary Chat Channel UI and Frontend Components
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-12"> SCRUM-12</a>
* Jira Task: Design the Chat Box UI and Frontend Components
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-15"> SCRUM-15</a>
* Jira Task: Implement Events for the Primary Chat Channel
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-13"> SCRUM-13</a>
* Jira Task: Write Unit and Integration Tests
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-14"> SCRUM-14</a>

Caden: Registered, set up, and implemented a MongoDB backend, connected it via fetch API calls (later changed to Axios by Chris B.). Created temporary and limited
python unittest testing for some of the backend. Added temporary login and user creation functionality. Integrated Usernames with the chat window.

* Jira Task: Set Up Cloud Hosting for Backend and Database
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-34"> SCRUM-34</a>
* Jira Task: Write Unit and Integration Tests
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-28"> SCRUM-28</a>
* Jira Task: Persist Usernames Across Sessions
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-27"> SCRUM-27</a>
* Jira Task: Display Usernames in Chat Messages
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-26"> SCRUM-26</a>
* Jira Task: Implement Backend API for Username Registration & Updates
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-25"> SCRUM-25</a>
* Jira Task: Design Database Schema for User Management
	* <a href = "https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-24"> SCRUM-24</a>

Ricky: Created a user status database, implemented frontend display for statuses and buttons to change current status, developed unit tests for the database,
	   and added an inactivity tracker to update status based on user activity.

* Jira Task: Design Database Schema for User Status Tracking 
   * <a href="https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-29">SCRUM-29</a>
* Jira Task: Update Frontend to Display User Status 
   * <a href="https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-31">SCRUM-31</a>
* Jira Task: Detect User Inactivity and Update Status (CHECK LABEL: completed in SCRUM-31) 
   * <a href="https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-32">SCRUM-32</a>
* Jira Task: Write Unit and Integration Tests
   * <a href="https://cs3398-changelings-spring.atlassian.net/browse/SCRUM-33">SCRUM-33</a>


## Screenshots
<img src="https://i.imgur.com/QxqSWGx.png" alt="AI Generated Secure Chat Logo" width="500" height="500">


## Project Status
-  Sprint 3 complete.

## Room for Improvement
*	Gather users or "beta testers" to collect usability features
*	Address security concerns
*   Fine-tune small bugs and the usability of the software

**To-do in Sprint 4:**
1. Fully switch to websockets where relevant
2. Segment and separate our larger files into several subsections
3. Introduce Fiber, an AI 'user'
4. Add in (a) minigame(s)
5. Switch to a fully browser-based, peer-to-peer, encrypted DM feature (establish DM connection via websocket, then communication directly)
6. Add developer mode features and rework entry (devpass stored in user-viewable plaintext)
7. add more/etc.


## Acknowledgements
- This project is inspired by Discord and Slack. Discord is too "gamer" centric and unprofessional to appeal
to an adult demographic, while "Slack" is not casual enough to appeal to a younger demographic. 
- We hope to combine casual and professional messaging into one seamless platform.

<!-- Optional -->
<!-- ## License -->
<!-- This project is open source and available under the [... License](). -->

<!-- You don't have to include all sections - just the one's relevant to your project -->