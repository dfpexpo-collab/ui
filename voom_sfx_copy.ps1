$root = 'E:\Ocular Sounds - The Ultimate Sound FX Bundle\Ocular Sounds - The Ultimate Sound FX Bundle'
$desk = [Environment]::GetFolderPath('Desktop')
$dst  = Join-Path $desk 'voom_sfx'
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$picks = @(
  @('whoosh_01.wav', 'Short Whooshes\DSGNWhsh_Quick Whoosh, Windy, Left to Right_Ocular Sounds_Short Whooshes_The Complete Whooshes Collection.wav'),
  @('whoosh_02.wav', 'Short Whooshes\DSGNWhsh_Quick Whoosh, Deep, Filtered, Right to Left_Ocular Sounds_Short Whooshes_The Complete Whooshes Collection.wav'),
  @('whoosh_03.wav', 'Quick Whips\DSGNWhsh_Short Whip, Short Whoosh 21_Ocular Sounds_Quick Whips_The Complete Whooshes Collection.wav'),
  @('whoosh_04.wav', 'Quick Whips\DSGNWhsh_Short Whip, Short Whoosh 30_Ocular Sounds_Quick Whips_The Complete Whooshes Collection.wav'),
  @('whoosh_05.wav', 'Short Whooshes\DSGNWhsh_Quick Whoosh, Jet, Airy, Plane_Ocular Sounds_Short Whooshes_The Complete Whooshes Collection.wav'),
  @('whoosh_06.wav', 'Epic Whooshes\DSGNWhsh_Punchy Whoosh_Ocular Sounds_Epic Whooshes_The Complete Whooshes Collection.wav'),
  @('riser_01.wav', 'Wind Risers\DSGNRise_Air Pressure, SciFi, Short Rise_Ocular Sounds_Wind Risers_The Complete Risers Collection.wav'),
  @('riser_02.wav', 'Wind Risers\DSGNRise_High Pitched SciFi, High Whoosh, Medium Rise_Ocular Sounds_Wind Risers_The Complete Risers Collection.wav'),
  @('riser_03.wav', 'Tonal Risers\DSGNRise_Short Sparkling Synth Riser, No Reverb_Ocular Sounds_Tonal Risers_The Complete Risers Collection.wav'),
  @('impact_01.wav', 'Deep Impacts\DSGNImpt_Deep Pre Shifted Bass Drop_Ocular Sounds_Deep Impacts_The Complete Impacts Collection.wav'),
  @('impact_02.wav', 'Epic Hits Vol. 1\DSGNImpt_Low Boom, Synth Impact, Rumble_Ocular Sounds_Epic Hits Vol 1_The Complete Impacts Collection.wav'),
  @('impact_03.wav', 'Deep Impacts\DSGNImpt_Soft Transient, Deep Drum Hit_Ocular Sounds_Deep Impacts_The Complete Impacts Collection.wav'),
  @('impact_04.wav', 'Epic Hits Vol. 1\DSGNImpt_Short Impact, Futuristic Impact, Sweep, Glitch_Ocular Sounds_Epic Hits Vol 1_The Complete Impacts Collection.wav'),
  @('ui_01.wav', 'Camera Shutters\COMCam_Short Click_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('ui_02.wav', 'Camera Shutters\COMCam_Very Short Click_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('ui_03.wav', 'Camera Shutters\COMCam_Single Click Shutter_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('ui_04.wav', 'Camera Shutters\COMCam_Pre Shifted Very Short Metal Click_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('ui_05.wav', 'Camera Shutters\COMCam_Short Beep Shutter_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('ui_06.wav', 'Camera Shutters\COMCam_Ascending Beep Shutter Flash_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('ui_07.wav', 'Camera Shutters\COMCam_Pre Shifted High Beep Shutter_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('ui_08.wav', 'Sci-Fi Glitches\UIGlitch-Futuristic_Machines Devices-Glitch 1_Ocular Sounds_Sci-Fi Glitches_The Complete Sci-Fi Collection.wav'),
  @('glitch_01.wav', 'Sci-Fi Glitches\UIGlitch-Futuristic_Machines Devices-Glitch 52_Ocular Sounds_Sci-Fi Glitches_The Complete Sci-Fi Collection.wav'),
  @('glitch_02.wav', 'Sci-Fi Glitches\UIGlitch-Futuristic_Machines Devices-Glitch 63_Ocular Sounds_Sci-Fi Glitches_The Complete Sci-Fi Collection.wav'),
  @('glitch_03.wav', 'Sci-Fi Glitches\UIGlitch-Futuristic_Machines Devices-Glitch 24_Ocular Sounds_Sci-Fi Glitches_The Complete Sci-Fi Collection.wav'),
  @('glitch_04.wav', 'Sci-Fi Glitches\UIGlitch-Futuristic_Machines Devices-Glitch 105_Ocular Sounds_Sci-Fi Glitches_The Complete Sci-Fi Collection.wav'),
  @('shimmer_01.wav', 'Magic Spells\MAGSpel_Blessing Magic, Spell Impact, Sparkling_Ocular Sounds_Magic Spells_The Complete Fantasy Collection.wav'),
  @('shimmer_02.wav', 'Magic Spells\MAGSpel_Blessing Magic, Fairy Spell Impact, Sparkling_Ocular Sounds_Magic Spells_The Complete Fantasy Collection.wav'),
  @('shimmer_03.wav', 'Magic Spells\MAGSpel_Blessing Magic, Musical Buff Spell Launch 2_Ocular Sounds_Magic Spells_The Complete Fantasy Collection.wav'),
  @('shimmer_04.wav', 'Magic Spells\MAGSpel_Ice Magic, Spell Cast, Sparkling, Loopable_Ocular Sounds_Magic Spells_The Complete Fantasy Collection.wav'),
  @('shimmer_05.wav', 'Epic Whooshes\DSGNWhsh_Chime Whoosh, Reversed, Cymbal, Metal_Ocular Sounds_Epic Whooshes_The Complete Whooshes Collection.wav'),
  @('typing_01.wav', 'Cinematic Mechanics\COMCam_Mech Mini Gears, Camera Switch Buttons_Ocular Sounds_Cinematic Mechanics_The Cinematic Elements Collection.wav'),
  @('typing_02.wav', 'Camera Shutters\COMCam_Dubble Shutter Click_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('typing_03.wav', 'Camera Shutters\COMCam_Quick Shutter, Button Pullback_Ocular Sounds_Camera Shutters_The Cinematic Elements Collection.wav'),
  @('transition_01.wav', 'Short Whooshes\DSGNWhsh_Quick Whoosh, Plain, Soft White Noise_Ocular Sounds_Short Whooshes_The Complete Whooshes Collection.wav'),
  @('transition_02.wav', 'Short Whooshes\DSGNWhsh_Quick Whoosh, Exhale, Deep, Filtered_Ocular Sounds_Short Whooshes_The Complete Whooshes Collection.wav'),
  @('transition_03.wav', 'Short Whooshes\DSGNWhsh_Quick Whoosh, Soft Snow, Small Tremelo_Ocular Sounds_Short Whooshes_The Complete Whooshes Collection.wav'),
  @('chime_01.wav', 'Epic Hits Vol. 2\DSGNImpt_Small Rising Whoosh, Metal Hit, Bell Tail_Ocular Sounds_Epic Hits Vol 2_The Complete Impacts Collection.wav'),
  @('chime_02.wav', 'Powerful Braaams\DSGNBram_Resonating Bell Reverb Impact, Low Pitch Synth, Key B_Ocular Sounds_Powerful Braaams_The Complete Impacts Collection.wav')
)
$ok = 0
foreach ($p in $picks) {
  $src = Join-Path $root $p[1]
  if (Test-Path -LiteralPath $src) { Copy-Item -LiteralPath $src -Destination (Join-Path $dst $p[0]) -Force; $ok++ }
  else { Write-Warning "Missing: $($p[1])" }
}
Compress-Archive -Path "$dst\*" -DestinationPath (Join-Path $desk 'voom_sfx.zip') -Force
"Done: $ok of $($picks.Count) copied -> $desk\voom_sfx.zip"
