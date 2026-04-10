@echo off
REM JMS Dev Lab - Weekly Site Health Check
REM Runs Claude Code with the weekly site check prompt
REM Scheduled via Windows Task Scheduler - Fridays at 2:00 PM

cd /d "C:\JM Programs\JMS Dev Lab"

claude -p "Read the file C:\JM Programs\JMS Dev Lab\scripts\weekly-site-check.md and execute all the steps described in it. Email the results to john@jmsdevlab.com using Gmail." --allowedTools "WebFetch,Read,Glob,mcp__claude_ai_Gmail__gmail_search_messages,mcp__claude_ai_Gmail__gmail_read_message,mcp__claude_ai_Gmail__gmail_create_draft" --model haiku

exit /b 0
