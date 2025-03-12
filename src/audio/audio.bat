if not exist "output" mkdir output

for /l %%x in (1, 1, 11) do (
    call audiosprite -o ch%%x -f howler -e ogg,m4a -s 1 -g  0.05 -v 9 -b 48 -r 44100 ch%%x/*.wav

    move ch%%x.json output
    move ch%%x.m4a output
    move ch%%x.ogg output
    move ch%%x.mp3 output
)

robocopy /s output ../main/webapp/assetPacks/desktop/sounds
robocopy /s output ../main/webapp/assetPacks/mobile/sounds
robocopy /s output ../main/webapp/assetPacks/tablet/sounds

