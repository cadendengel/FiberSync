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

We are a team of programmers called the Changelings (Chris Beverly, Chris Clark, Caden Dengel, and Ricky Mosqueda-Torres) 
working together to create a privately hosted messaging application so that students, professionals, and recreational users 
can utilize a platform that accounts for their working environment and prioritizes their data and privacy.


## Technologies Used
*	<a href="https://flask.palletsprojects.com/en/stable/">Flask</a> - Backend web Framework for API
*	<a href="https://www.python.org/">Python</a> - Primary backend Programming Language
*	<a href="https://react.dev/">React</a> - Frontend UI
*	Database Technology - Options for storage
	*	<a href="https://www.mongodb.com/">MongoDB</a> - Flexible document-based database
*	Authentication Technology - TBD, May be necessary to encode logins, might not be necessary for this small scale development though.
*	Deployment Technology - TBD


## Features

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



Chris B:



## Screenshots
<img src="https://i.imgur.com/QxqSWGx.png" alt="AI Generated Secure Chat Logo" width="500" height="500">
<!-- If you have screenshots you'd like to share, include them here. -->


## Project Status
-  in progress 


## Room for Improvement

*	Gather users or "beta testers" to collect usability features
*	Address hosting and server resource concerns

To do:

1.	Primary Chat Channel
2.	Chat Entry Box
3.	Usernames
4.  Message Persistence
5.	User Status


## Acknowledgements
- This project is inspired by Discord and Slack. Discord is too "gamer" centric and unprofessional to appeal
to an adult demographic, while "Slack" is not casual enough to appeal to a younger demographic. 
- We hope to combine casual and professional messaging into one seamless platform.

<!-- Optional -->
<!-- ## License -->
<!-- This project is open source and available under the [... License](). -->

<!-- You don't have to include all sections - just the one's relevant to your project -->