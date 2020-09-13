###################################
# Qtile Config Created by Bojofil
#
# https://github.com/Bojofil
#
# bojofil@protonmail.com
###################################

import os
import re
import socket
import subprocess
from libqtile.config import Key, Screen, Group, Drag, Click, Rule
from libqtile.command import lazy
from libqtile import layout, bar, widget, hook
from typing import List 


mod = "mod4"                                     
myTerm = "st"                                    
myConfig = "/home/justin/.config/qtile/config.py"
PROMPT = "rofi -lines 12 -padding 18 -width 60 -location 0 -show drun -sidebar-mode -columns 3"
Chromium = "chromium"    


keys = [
         Key(
             [mod], "Return",
             lazy.spawn(myTerm),
             desc='Launches Terminal'
             ),
         Key(
             [mod], "d", 
             lazy.spawn(PROMPT),
             desc='Rofi Application Launcher'
             ),
         Key(
             [mod], "Tab",
             lazy.next_layout(),
             desc='Toggle through layouts'
             ),
         Key(
             [mod], "c",
             lazy.window.kill(),
             desc='Kill active window'
             ),
         Key(
             [mod, "shift"], "r",
             lazy.restart(),
             desc='Restart Qtile'
             ),
        Key(
             [mod, "shift"], "w",
             lazy.spawn(Chromium),
             desc='Launch Chromium'
             ),
         Key(
             [mod, "shift"], "q",
             lazy.shutdown(),
             desc='Shutdown Qtile'
             ),
         Key([mod], "e",
             lazy.to_screen(0),
             desc='Keyboard focus to monitor 1'
             ),
         Key([mod], "w",
             lazy.to_screen(1),
             desc='Keyboard focus to monitor 2'
             ),
         Key([mod], "r",
             lazy.to_screen(2),
             desc='Keyboard focus to monitor 3'
             ),
         Key([mod], "period",
             lazy.next_screen(),
             desc='Move focus to next monitor'
             ),
         Key([mod], "comma",
             lazy.prev_screen(),
             desc='Move focus to prev monitor'
             ),
         Key([mod, "control"], "k",
             lazy.layout.section_up(),
             desc='Move up a section in treetab'
             ),
         Key([mod, "control"], "j",
             lazy.layout.section_down(),
             desc='Move down a section in treetab'
             ),
         Key(
             [mod], "k",
             lazy.layout.down(),
             desc='Move focus down in current stack pane'
             ),
         Key(
             [mod], "j",
             lazy.layout.up(),
             desc='Move focus up in current stack pane'
             ),
         Key(
             [mod, "shift"], "k",
             lazy.layout.shuffle_down(),
             desc='Move windows down in current stack'
             ),
         Key(
             [mod, "shift"], "j",
             lazy.layout.shuffle_up(),
             desc='Move windows up in current stack'
             ),
         Key(
             [mod], "h",
             lazy.layout.grow(),
             lazy.layout.increase_nmaster(),
             desc='Expand window (MonadTall), increase number in master pane (Tile)'
             ),
         Key(
             [mod], "l",
             lazy.layout.shrink(),
             lazy.layout.decrease_nmaster(),
             desc='Shrink window (MonadTall), decrease number in master pane (Tile)'
             ),
         Key(
             [mod], "n",
             lazy.layout.normalize(),
             desc='normalize window size ratios'
             ),
         Key(
             [mod], "m",
             lazy.layout.maximize(),
             desc='toggle window between minimum and maximum sizes'
             ),
         Key(
             [mod, "shift"], "f",
             lazy.window.toggle_floating(),
             desc='toggle floating'
             ),
         Key(
             [mod, "shift"], "space",
             lazy.layout.rotate(),
             lazy.layout.flip(),
             desc='Switch which side main pane occupies (XmonadTall)'
             ),
         Key(
             [mod], "space",
             lazy.layout.next(),
             desc='Switch window focus to other pane(s) of stack'
             ),
         Key(
             [mod, "control"], "Return",
             lazy.layout.toggle_split(),
             desc='Toggle between split and unsplit sides of stack'
             ),

]


group_names = [("", {'layout': 'monadtall'}),
               ("", {'layout': 'monadtall'}),
               ("", {'layout': 'monadtall'}),
               ("", {'layout': 'monadtall'}),
               ("", {'layout': 'max'}),
               ("", {'layout': 'monadtall'}),
               ("", {'layout': 'monadtall'}),
               ("", {'layout': 'monadtall'}),]

groups = [Group(name, **kwargs) for name, kwargs in group_names]

for i, (name, kwargs) in enumerate(group_names, 1):
    keys.append(Key([mod], str(i), lazy.group[name].toscreen()))        
    keys.append(Key([mod, "shift"], str(i), lazy.window.togroup(name)))

layout_theme = {"border_width": 0,
                "margin": 6,
                "borer_focus": "#0b090f",
                "border_normal": "#0b090f"
                }


layouts = [
    #layout.MonadWide(**layout_theme),
    layout.Bsp(**layout_theme),
    #layout.Stack(stacks=2, **layout_theme),
    #layout.Columns(**layout_theme),
    #layout.RatioTile(**layout_theme),
    #layout.VerticalTile(**layout_theme),
    #layout.Matrix(**layout_theme),
    #layout.Zoomy(**layout_theme),
    layout.MonadTall(**layout_theme),
    layout.Max(**layout_theme),
    #layout.Tile(shift_windows=True, **layout_theme),
    #layout.Stack(num_stacks=2),
    layout.TreeTab(
         font = "FiraGO Medium",
         fontsize = 10,
         sections = ["FIRST", "SECOND"],
         section_fontsize = 11,
         bg_color = "#0b090f",
         active_bg = "#6b4f6d",
         active_fg = "#EFC4C4",
         inactive_bg = "#0b090f",
         inactive_fg = "#8A9CA2",
         padding_y = 5,
         section_top = 10,
         panel_width = 320
         ),
     #layout.Floating(**layout_theme)
]


colors = [["#0b090f", "#0b090f"], 
          ["#6b4f6d", "#6b4f6d"], 
          ["#EFC4C4", "#EFC4C4"], 
          ["#0b090f", "#0b090f"], 
          ["#976d90", "#976d90"], 
          ["#6b4f6d", "#6b4f6d"], 
          ["#EFC4C4", "#EFC4C4"],
          ["#A58AA4", "#A58AA4"]]



widget_defaults = dict(
    font="FiraGO Nerd Font Medium",
    fontsize = 12,
    padding = 2,
    background=colors[0]
)
extension_defaults = widget_defaults.copy()



def init_widgets_list():
    widgets_list = [
               widget.GroupBox(font="FiraGO Nerd Font Medium",
                        fontsize = 24,
                        margin_y = 3,
                        margin_x = 0,
                        padding_y = 3,
                        padding_x = 1,
                        borderwidth = 2,
                        active = colors[2],
                        inactive = colors[2],
                        rounded = False,
                        highlight_color = colors[4],
                        highlight_method = "line",
                        this_current_screen_border = colors[7],
                        this_screen_border = colors [7],
                        other_current_screen_border = colors[7],
                        other_screen_border = colors[7],
                        foreground = colors[2],
                        background = colors[5]
                        ),
               widget.TextBox(
                        text='',
                        background = colors[0],
                        foreground = colors[5],
                        padding=0,
                        fontsize=36
                        ),          
               widget.WindowName(
                        foreground = colors[2],
                        background = colors[0],
                        padding = 0,
                        font= "FiraGO Medium",
                        fontsize = 12
                        ),
                widget.TextBox(
                        text='',
                        background = colors[0],
                        foreground = colors[5],
                        padding=0,
                        fontsize=36
                        ),
               widget.TextBox(
                        text="  ",
                        padding = 0,
                        foreground=colors[2],
                        background=colors[5],
                        fontsize=12
                        ),
               widget.CPU(
                        foreground=colors[2],
                        background=colors[5],
                        padding = 0,
                        update_interval = 1.0,
                        fontsize=12,
                        format = '{load_percent}%'
                        ),
               widget.TextBox(
                        text='',
                        background = colors[5],
                        foreground = colors[4],
                        padding=0,
                        fontsize=36
                        ),
               widget.TextBox(
                        text=" ",
                        padding = 2,
                        foreground=colors[2],
                        background=colors[4],
                        fontsize=14
                        ),
               widget.ThermalSensor(
                        foreground=colors[2],
                        background=colors[4],
                        padding = 5
                        ),
               widget.TextBox(
                        text='',
                        background = colors[4],
                        foreground = colors[5],
                        padding=0,
                        fontsize=36
                        ),
               widget.TextBox(
                        text="  ",
                        foreground=colors[2],
                        background=colors[5],
                        padding = 0,
                        fontsize=14
                        ),
               widget.Memory(
                        foreground = colors[2],
                        background = colors[5],
                        padding = 5,
                        format = '{MemUsed}M'
                        ),
               widget.TextBox(
                        text='',
                        background = colors[5],
                        foreground = colors[4],
                        padding=0,
                        fontsize=36
                        ),
               widget.Net(
                        interface = "eno1",
                        format = ' {down}  {up}',
                        foreground = colors[2],
                        background = colors[4],
                        padding = 5
                        ),
               widget.TextBox(
                        text='',
                        background = colors[4],
                        foreground = colors[5],
                        padding=0,
                        fontsize=36
                        ),
               widget.TextBox(
                       text=" ",
                        foreground=colors[2],
                        background=colors[5],
                        padding = 0
                        ),
               widget.Volume(
                        foreground = colors[2],
                        background = colors[5],
                        padding = 5
                        ),
               widget.TextBox(
                        text='',
                        background = colors[5],
                        foreground = colors[4],
                        padding=0,
                        fontsize=36
                        ),
               #widget.CurrentLayoutIcon(
                        #custom_icon_paths=[os.path.expanduser("~/.config/qtile/icons")],
                        #foreground = colors[2],
                        #background = colors[4],
                        #padding = 0,
                        #scale=0.7
                        #),
               widget.CurrentLayout(
                        foreground = colors[2],
                        background = colors[4],
                        padding = 5
                        ),
               widget.TextBox(
                        text='',
                        background = colors[4],
                        foreground = colors[5],
                        padding=0,
                        fontsize=36
                        ),
               widget.Clock(
                        foreground = colors[2],
                        background = colors[5],
                        format="  %A %B %d, %Y    %l:%M %p "
                        ),
               widget.Sep(
                        linewidth = 0,
                        padding = 10,
                        foreground = colors[0],
                        background = colors[5]
                        ),
              ]
    return widgets_list

# Screens

def init_widgets_screen1():
    widgets_screen1 = init_widgets_list()
    return widgets_screen1                       

def init_widgets_screen2():
    widgets_screen2 = init_widgets_list()
    return widgets_screen2                       

def init_screens():
    return [Screen(top=bar.Bar(widgets=init_widgets_screen1(), opacity=0.95, size=20)),
            Screen(top=bar.Bar(widgets=init_widgets_screen2(), opacity=0.95, size=20)),
            Screen(top=bar.Bar(widgets=init_widgets_screen1(), opacity=0.95, size=20))]

if __name__ in ["config", "__main__"]:
    screens = init_screens()
    widgets_list = init_widgets_list()
    widgets_screen1 = init_widgets_screen1()
    widgets_screen2 = init_widgets_screen2()


mouse = [
    Drag([mod], "Button1", lazy.window.set_position_floating(),
         start=lazy.window.get_position()),
    Drag([mod], "Button3", lazy.window.set_size_floating(),
         start=lazy.window.get_size()),
    Click([mod], "Button2", lazy.window.bring_to_front())
]

dgroups_key_binder = None
dgroups_app_rules = []


@hook.subscribe.client_new
def assign_app_group(client):
     d = {}
     d[""] = ["Chromium", "chromium", ]
     d[""] = [ "st-256color", "sh", ]
     d[""] = ["Thunar", "Ranger", "Nitrogen", "thunar", "ranger", "nitrogen",  ]
     d[""] = ["code-oss", "Code-oss", "Code", "code", ]
     d[""] = ["net-runelite-client-RuneLite", ]
     d[""] = ["Spotify","spotify", "Discord", "discord", ]
     d[""] = ["Google-chrome", "google-chrome", ]
     d[""] = ["Thunderbird", "thunderbird", ]
     wm_class = client.window.get_wm_class()[0]

     for i in range(len(d)):
         if wm_class in list(d.values())[i]:
             group = list(d.keys())[i]
             client.togroup(group)

main = None
follow_mouse_focus = True
bring_front_click = False
cursor_warp = False


auto_fullscreen = True
focus_on_window_activation = "urgent"


@hook.subscribe.startup_once
def start_once():
    home = os.path.expanduser('~')
    subprocess.call([home + '/.config/qtile/autostart.sh'])
wmname = "Qtile"
