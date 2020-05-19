================================
Possible problems
================================

******************************************************************
Error: Command failed: git submodule update -q --init --recursive
******************************************************************

.. attribute:: OS Windows

If you have a similar error. Then check the PATH. Perhaps you have problems with PATH for Git.

To solve the problem add to PATH <git_directory>\usr\bin and <git_directory>\mingw64\libexec\git-core

If git installed in default directory, run the command ``set PATH=%PATH%;C:\Program Files\Git\usr\bin;C:\Program Files\Git\mingw64\libexec\git-core``
