#
# RSF Medals
# A browser extension for the Rally Sim Fans website
# Copyright 2024 Fixfactory
#
# This file is part of RSF Medals.
#
# RSF Medals is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free
# Software Foundation, either version 3 of the License, or any later version.
#
# RSF Medals is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along
# with RSF Medals. If not, see <http://www.gnu.org/licenses/>.
#

import os
import zipfile
import json

# Get the version number from the manifest
with open(".\\manifest.json") as json_data:
    manifest = json.load(json_data)

version = manifest['version']
zipName = "RSFMedals-v" + version + ".zip"

print("Packaging " + zipName)

# Zip the files
zf = zipfile.ZipFile(".\\builds\\" + zipName, "w")

for dirname, subdirs, files in os.walk(".\\icons\\"):
    for filename in files:
        zf.write(os.path.join(dirname, filename))

for dirname, subdirs, files in os.walk(".\\images\\"):
    for filename in files:
        zf.write(os.path.join(dirname, filename))

zf.write(".\\manifest.json")
zf.write(".\\main.js")
zf.close()
