# Assembly of documentation

To build the documentation you need to install sphinx
https://www.sphinx-doc.org/en/master/usage/installation.html

And after you need to install "recommonmark" and "sphinx_rtd_theme"
You can read about installation here:

recommonmark - https://recommonmark.readthedocs.io/en/latest/

sphinx_rtd_theme - https://sphinx-rtd-theme.readthedocs.io/en/stable/

Then at the root of the project run the command `sphinx-build -b html docs build-docs`

Where `docs` folder with source files and configs

And in `build-docs` ready documentation will be collected
