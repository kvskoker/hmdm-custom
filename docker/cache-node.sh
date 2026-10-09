#!/bin/sh
set -eu

# Verify frontend-maven-plugin's downloads before it reuses its Maven cache.
for version in 22.17.0 22.12.0; do
    directory="/root/.m2/repository/com/github/eirslett/node/$version"
    archive="node-$version-linux-x64.tar.gz"
    upstream="node-v$version-linux-x64.tar.gz"
    mkdir -p "$directory"
    curl -fSL --retry 5 --retry-all-errors --connect-timeout 20 --max-time 600 \
        "https://nodejs.org/dist/v$version/SHASUMS256.txt" -o "$directory/checksums.txt"
    checksum=$(awk -v file="$upstream" '$2 == file { print $1 }' "$directory/checksums.txt")
    test -n "$checksum"
    if ! (cd "$directory" && printf '%s  %s\n' "$checksum" "$archive" | sha256sum -c -); then
        curl -fSL --retry 5 --retry-all-errors --connect-timeout 20 --max-time 600 \
            "https://nodejs.org/dist/v$version/$upstream" -o "$directory/$archive.part"
        (cd "$directory" && printf '%s  %s.part\n' "$checksum" "$archive" | sha256sum -c -)
        mv "$directory/$archive.part" "$directory/$archive"
    fi
done
