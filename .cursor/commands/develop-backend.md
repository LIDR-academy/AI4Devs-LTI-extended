Please analyze and fix the Jira ticket: $ARGUMENTS.

Follow these steps:

1. Use Jira MCP to get the ticket details, whether it is the ticket id/number, keywords referring to the ticket or indicating status, like "the one in progress"
2. Understand the problem described in the ticket
3. Search the codebase for relevant files
4. Start a new branch using the ID of the ticket (for example SCRUM-1)
5. Implement the necessary changes to solve the ticket, following the order of the different tasks and making sure you accomplish all of them in order, like writing and running tests to verify the solution, updating documentation, etc.
6. Ensure code passes linting and type checking
7. Stage only the files affected by the ticket, and leave any other file changed out of the commit. Create a descriptive commit message
8. Push and create a PR, using the ID of the ticket (for example SCRUM-1) so it gets linked in Jira ticket

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.