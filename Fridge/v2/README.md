v2 is a python implementation of the loader, it was triggered by cron.
I wanted to explore a file watcher in node and using pm2.
Since cron can kick off a job at most 1 time a minute there was a natural delay.
a file watcher would expedite the processing of it.
pm2 is also a service, so the service is running in a loop instead of using cron.
internally where i work we dont have access to create systemd services in redhat, 
but i have full management over pm2 (once they create the systemd service for pm2)
so thats attractive, in addition to node being js, which everything else in mirth is.