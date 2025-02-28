In doing v2 i moved to node and a file watcher and pm2.
I found out that the filewatcher is very much on top of things, perhaps a little too 
much. I try scaling it back a little, but it did seem to overwhelm the system.
I had it set to process existing files in the directory, obviously, because i dont
want to miss any transactions that were created when the watcher is down. but it turns
out that it not only creates an "add" event, but it starts up a listener for each file
to watch for changes `cat /proc/sys/fs/inotify/max_user_instances` shows that a user can 
only have 128 watchers by default, and we coul dvery easily have 44k pending files, if the 
service was down for even 5 minutes. so it wouldnt even barely get started and it would
crash. The fix is once a file is detected and added to the list of files to process, it would remove
that file from the watch list. This strikes me as expensive becase its starting a watcher just
to immediately stop it. 

So i think for v4, doing a hybrid of v2 and v3 makes sense. using node and pm2 is nice, and i 
would like to keep those benefits, but not using a file watcher which basically is just too 
much resources to a process that is secondary to our mirth instance. The second i turned it on
our most sensitive interfaces (adt) started to freak out, so I backed it out, but it did run 
for about an hour. Im not 100% sure it was related, but odds point to it being the cause of 
issues with adt. So v4 will be a node pm2 service, that is always running, but in each loop it
just gets a list of files, processes them, and then pauses, and then does the next loop.
