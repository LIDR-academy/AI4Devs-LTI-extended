Please analyze and fix the Jira ticket: $ARGUMENTS.

Follow these steps:

1. Understand the problem described in the ticket
2. Search the codebase for relevant files
3. Start a new branch using the ID of the ticket (for example SCRUM-1)
4. Implement the necessary changes to solve the ticket, following the order of the different tasks and making sure you accomplish all of them in order, like writing and running tests to verify the solution, updating documentation, etc.
5. Ensure code passes linting and type checking
6. Stage only the files affected by the ticket, and leave any other file changed out of the commit. Create a descriptive commit message
7. Push and create a PR, using the ID of the ticket (for example SCRUM-1) so it gets linked in Jira ticket

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.