@echo off
REM JMS Dev Lab - Daily Client Acquisition Monitoring
REM Runs Claude Code with the daily monitoring prompt
REM Scheduled via Windows Task Scheduler - weekdays at 9:00 AM

cd /d "C:\JM Programs\JMS Dev Lab"

claude -p "Read the file C:\JM Programs\JMS Dev Lab\scripts\daily-monitoring.md and execute all the steps described in it. Email the summary to john@jmsdevlab.com using Gmail." --allowedTools "WebFetch,WebSearch,Grep,Read,Glob,mcp__claude_ai_Gmail__gmail_search_messages,mcp__claude_ai_Gmail__gmail_read_message,mcp__claude_ai_Gmail__gmail_create_draft" --model haiku

exit /b 0
