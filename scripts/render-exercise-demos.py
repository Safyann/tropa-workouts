"""Render the local exercise demonstrations. Run with Python and Pillow."""
from argparse import ArgumentParser
from math import cos, pi
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "public" / "exercise-demos"
SIZE = (320, 208)
BACKGROUND = "#263d30"
NEAR = "#e6efd8"
FAR = "#a0b5a2"
ACCENT = "#f5b75f"
EQUIPMENT = "#829b89"

# Head, shoulder, hip, near elbow/hand/knee/ankle, far elbow/hand/knee/ankle.
def pose(*coordinates):
    joints = tuple(zip(coordinates[::2], coordinates[1::2]))
    return joints if len(joints) == 11 else joints + tuple(
        (x - 7, y - 2) for x, y in joints[3:7]
    )


def adjust(joints, **changes):
    indices = dict(head=0, shoulder=1, hip=2, elbow=3, hand=4, knee=5, ankle=6,
                   far_elbow=7, far_hand=8, far_knee=9, far_ankle=10)
    result = list(joints)
    for joint, position in changes.items():
        result[indices[joint]] = position
    return tuple(result)


def rep(start, end):
    return (start, end, start)


def swap_sides(joints):
    head, shoulder, hip, elbow, hand, knee, ankle, far_elbow, far_hand, far_knee, far_ankle = joints
    return (head, shoulder, hip, far_elbow, far_hand, far_knee, far_ankle, elbow, hand, knee, ankle)


stand = pose(118, 35, 116, 52, 114, 91, 120, 75, 121, 94, 120, 115, 117, 139)
squat = pose(132, 62, 122, 77, 100, 106, 135, 83, 155, 75, 131, 109, 117, 139)
goblet_start = adjust(stand, elbow=(125, 75), hand=(135, 59), far_elbow=(118, 75), far_hand=(129, 58))
goblet_end = adjust(squat, elbow=(133, 96), hand=(141, 82), far_elbow=(126, 95), far_hand=(135, 81))
bench_press = pose(68, 88, 84, 97, 134, 99, 103, 109, 103, 88, 152, 113, 151, 139,
                   85, 106, 85, 87, 143, 108, 142, 138)
floor_press = pose(65, 126, 83, 134, 131, 136, 106, 139, 106, 118, 151, 112, 167, 139,
                   88, 139, 88, 118, 143, 111, 158, 139)
supported_row = pose(145, 48, 130, 63, 92, 81, 128, 91, 126, 113, 87, 111, 82, 139,
                     148, 82, 164, 103, 101, 110, 106, 139)
bent_row = pose(148, 52, 133, 65, 92, 88, 130, 91, 129, 114, 101, 113, 91, 139)
bent_row_top = adjust(bent_row, elbow=(109, 66), hand=(114, 90), far_elbow=(101, 64), far_hand=(106, 88))
wall_push = pose(138, 34, 131, 51, 116, 87, 151, 55, 174, 58, 104, 113, 96, 138)
floor_push = pose(157, 79, 146, 94, 99, 111, 144, 117, 145, 139, 73, 122, 49, 135)
bridge = pose(65, 127, 83, 134, 128, 135, 100, 137, 121, 140, 149, 104, 172, 139)
prone = pose(74, 113, 92, 118, 148, 121, 105, 138, 84, 139, 174, 127, 199, 135,
             103, 101, 81, 102, 174, 123, 198, 129)
seated = pose(118, 32, 116, 48, 116, 98, 135, 66, 135, 44, 142, 111, 145, 139,
              96, 66, 96, 44, 132, 110, 132, 139)
press_up = dict(elbow=(135, 28), hand=(134, 10), far_elbow=(98, 28), far_hand=(99, 10))
standing_press = adjust(stand, elbow=(135, 70), hand=(135, 47), far_elbow=(96, 70), far_hand=(96, 47))
dead_bug = pose(63, 128, 82, 134, 123, 136, 81, 111, 80, 88, 122, 105, 154, 105,
                90, 111, 88, 88, 129, 103, 161, 103)
bird_dog = pose(150, 78, 134, 91, 94, 95, 137, 116, 137, 139, 95, 131, 65, 139,
                128, 114, 128, 139, 87, 129, 58, 138)
hinge_end = pose(151, 67, 137, 78, 92, 92, 130, 104, 120, 129, 106, 116, 103, 139)
walk_center = adjust(stand, elbow=(106, 72), hand=(119, 81), far_elbow=(131, 75), far_hand=(139, 62))
walk_left = adjust(walk_center, knee=(133, 110), ankle=(149, 139), far_knee=(101, 115),
                   far_ankle=(82, 138), elbow=(104, 69), hand=(90, 82), far_elbow=(132, 70),
                   far_hand=(147, 62))
walk_right = adjust(walk_center, far_knee=(133, 110), far_ankle=(149, 139), knee=(101, 115),
                    ankle=(82, 138), far_elbow=(104, 69), far_hand=(90, 82), elbow=(132, 70),
                    hand=(147, 62))

quad_stretch = adjust(stand, elbow=(100, 73), hand=(91, 87), knee=(117, 117), ankle=(92, 89),
                      far_elbow=(135, 61), far_hand=(174, 59))
chest_wall = adjust(stand, elbow=(174, 60), hand=(174, 38), far_elbow=(110, 72), far_hand=(111, 92))
triceps = adjust(stand, elbow=(122, 22), hand=(109, 50), far_elbow=(102, 26), far_hand=(119, 21))
arm_raise = adjust(stand, elbow=(141, 69), hand=(160, 88), far_elbow=(94, 70), far_hand=(79, 87))
arm_circles = (
    arm_raise,
    adjust(arm_raise, elbow=(155, 53), hand=(178, 55), far_elbow=(81, 51), far_hand=(59, 52)),
    adjust(arm_raise, elbow=(141, 33), hand=(158, 15), far_elbow=(95, 31), far_hand=(78, 13)),
    adjust(arm_raise, elbow=(124, 51), hand=(143, 52), far_elbow=(107, 49), far_hand=(86, 49)),
    arm_raise,
)
reach = adjust(stand, elbow=(140, 57), hand=(162, 57), far_elbow=(108, 73), far_hand=(114, 92))
reach_up = adjust(reach, hand=(160, 47))
reach_down = adjust(reach, hand=(160, 67))
calf_stretch = adjust(wall_push, knee=(126, 115), ankle=(131, 139), far_knee=(91, 112), far_ankle=(73, 140))
twist = adjust(stand, elbow=(132, 70), hand=(125, 63), far_elbow=(100, 70), far_hand=(107, 63))
lying_stretch = adjust(bridge, elbow=(106, 118), hand=(129, 109), far_elbow=(102, 112), far_hand=(126, 103),
                       knee=(131, 108), ankle=(149, 112))
wall_reach = adjust(wall_push, elbow=(153, 60), hand=(174, 60), far_elbow=(147, 60), far_hand=(174, 58))

BENCH = (((49, 101), (152, 101)), ((58, 101), (58, 141)), ((143, 101), (143, 141)))
SQUAT_BENCH = (((49, 111), (104, 111)), ((55, 111), (55, 141)), ((97, 111), (97, 141)))
ROW_BENCH = (((145, 106), (192, 106)), ((151, 106), (151, 141)), ((185, 106), (185, 141)))
SEAT = (((94, 104), (137, 104)), ((99, 104), (99, 141)), ((132, 104), (132, 141)))
WALL = (((175, 19), (175, 141)),)
ELLIPTICAL = (((72, 142), (181, 142), (171, 75), (154, 70)),)
PULL_UP_BAR = (((67, 25), (172, 25)),)
RING_ANCHOR = (((79, 5), (162, 5)),)
CABLE_TOWER = (((186, 29), (186, 142)), ((178, 30), (186, 30)))
DIP_BARS = (((72, 90), (135, 90)), ((96, 96), (162, 96)), ((83, 90), (83, 142)),
            ((151, 96), (151, 142)))
STEP_BOX = (((143, 143), (143, 105), (189, 105), (189, 143)),)
CALF_BOARD = (((119, 143), (119, 135), (144, 135), (144, 143)),)

elliptical_start = pose(122, 33, 118, 50, 109, 88, 139, 70, 160, 62, 132, 106, 138, 125,
                        134, 66, 148, 52, 101, 108, 84, 134)
elliptical_end = adjust(elliptical_start, elbow=(134, 66), hand=(148, 52), knee=(101, 108),
                        ankle=(84, 134), far_elbow=(139, 70), far_hand=(160, 62),
                        far_knee=(132, 106), far_ankle=(138, 125))
deadlift_start = adjust(squat, head=(143, 60), shoulder=(134, 78), hip=(92, 94),
                        elbow=(139, 104), hand=(146, 130), far_elbow=(133, 102),
                        far_hand=(139, 128))
squat_bar = adjust(stand, elbow=(96, 74), hand=(102, 52), far_elbow=(134, 69), far_hand=(128, 50))
squat_bar_low = adjust(squat, elbow=(102, 94), hand=(108, 74), far_elbow=(140, 90),
                       far_hand=(134, 75))
bar_press_top = adjust(bench_press, elbow=(93, 75), hand=(96, 53), far_elbow=(111, 76),
                       far_hand=(113, 53))
bar_press_bottom = adjust(bench_press, hand=(101, 86), far_elbow=(83, 109), far_hand=(85, 86))
hang = pose(119, 63, 117, 78, 115, 110, 136, 50, 148, 25, 113, 126, 114, 141,
            101, 49, 90, 25, 106, 126, 107, 139)
pulled_up = adjust(hang, head=(119, 14), shoulder=(119, 33), hip=(111, 71),
                   elbow=(143, 51), far_elbow=(96, 49), knee=(111, 96), ankle=(118, 117),
                   far_knee=(105, 94), far_ankle=(113, 114))
ring_hang = adjust(hang, hand=(140, 76), far_hand=(102, 75), head=(120, 103),
                   shoulder=(119, 118), hip=(119, 156), elbow=(131, 94), far_elbow=(109, 94),
                   knee=(117, 180), far_knee=(111, 180), ankle=(120, 201), far_ankle=(114, 200))
ring_pull = adjust(ring_hang, head=(121, 57), shoulder=(120, 73), hip=(117, 109),
                   elbow=(143, 98), far_elbow=(100, 97), knee=(116, 137), far_knee=(110, 135),
                   ankle=(118, 163), far_ankle=(112, 161))
ring_dip_low = adjust(ring_pull, head=(130, 39), shoulder=(121, 56), hip=(109, 94),
                      elbow=(120, 79), far_elbow=(98, 65), knee=(112, 123), far_knee=(106, 122),
                      ankle=(116, 146), far_ankle=(109, 146))
ring_dip_top = adjust(ring_dip_low, head=(121, 17), shoulder=(121, 32), hip=(121, 70),
                      elbow=(130, 54), far_elbow=(111, 53), knee=(121, 99), far_knee=(115, 98),
                      ankle=(125, 125), far_ankle=(117, 124))
cable_kneel = pose(124, 53, 118, 69, 108, 107, 141, 75, 129, 58, 121, 138, 97, 139,
                    134, 73, 124, 56, 114, 137, 90, 137)
cable_crunch = adjust(cable_kneel, head=(146, 102), shoulder=(134, 96), elbow=(138, 122),
                      hand=(144, 102), far_elbow=(133, 113), far_hand=(141, 98))
dip = pose(116, 25, 113, 43, 116, 86, 112, 67, 114, 96, 123, 112, 107, 135,
           99, 66, 101, 90, 116, 110, 100, 133)
plank_kneeling = pose(163, 100, 147, 108, 97, 119, 146, 137, 169, 140, 78, 138, 57, 139)
plank_hold = adjust(plank_kneeling, hip=(100, 120), knee=(75, 125), ankle=(48, 133),
                    far_knee=(69, 123), far_ankle=(45, 132))
lateral_raise = pose(119, 34, 119, 51, 119, 91, 143, 72, 151, 92, 130, 115, 133, 139,
                     96, 72, 88, 92, 107, 115, 105, 139)

split_landing = pose(115, 53, 113, 69, 108, 104, 131, 84, 141, 71, 143, 116, 143, 139,
                     94, 83, 81, 96, 84, 130, 70, 131)
split_jump = pose(115, 25, 114, 41, 110, 76, 117, 59, 118, 80, 126, 97, 129, 123,
                  105, 59, 102, 78, 100, 99, 91, 122)
rear_lunge = pose(124, 56, 121, 71, 117, 105, 123, 89, 124, 108, 142, 116, 121, 139,
                  114, 88, 113, 107, 93, 132, 76, 133)
forward_lunge = pose(133, 56, 130, 72, 125, 107, 113, 90, 119, 73, 154, 115, 153, 139,
                      144, 89, 139, 72, 114, 133, 116, 135)
front_rack = adjust(stand, elbow=(145, 56), hand=(126, 51),
                    far_elbow=(140, 58), far_hand=(118, 50))
front_squat_low = adjust(squat, elbow=(150, 79), hand=(130, 74),
                         far_elbow=(144, 81), far_hand=(122, 73))
good_morning_low = adjust(hinge_end, elbow=(120, 87), hand=(131, 77),
                          far_elbow=(151, 86), far_hand=(140, 78))
crunch_start = pose(63, 129, 83, 135, 129, 136, 97, 123, 72, 127, 148, 105, 171, 139,
                    93, 119, 69, 125, 141, 103, 164, 138)
crunch_end = adjust(crunch_start, head=(87, 96), shoulder=(99, 111), elbow=(115, 100),
                    hand=(95, 94), far_elbow=(111, 95), far_hand=(90, 91))
superman_start = pose(152, 125, 139, 134, 99, 136, 162, 136, 186, 139, 73, 136, 50, 136,
                      158, 131, 182, 134, 69, 131, 46, 131)
superman_top = adjust(superman_start, head=(157, 104), shoulder=(140, 117),
                      elbow=(163, 112), hand=(186, 108), far_elbow=(159, 108),
                      far_hand=(183, 104), knee=(75, 126), ankle=(51, 117),
                      far_knee=(71, 121), far_ankle=(47, 112))
single_bridge = adjust(bridge, far_knee=(108, 102), far_ankle=(133, 93))
single_bridge_top = adjust(single_bridge, hip=(125, 105), far_knee=(104, 71), far_ankle=(130, 65))
climber_left = adjust(floor_push, knee=(122, 124), ankle=(98, 137))
climber_right = adjust(floor_push, far_knee=(116, 119), far_ankle=(93, 133))
concentration_curl = pose(126, 52, 114, 68, 94, 100, 129, 103, 118, 128, 135, 108, 144, 139,
                          105, 89, 112, 110, 114, 112, 111, 139)
step_up_start = adjust(stand, knee=(132, 103), ankle=(154, 101))
step_up_top = pose(159, 3, 156, 20, 151, 56, 158, 42, 159, 65, 155, 80, 154, 101,
                   151, 40, 152, 63, 148, 79, 148, 100)
calf_raise_start = adjust(stand, knee=(116, 114), far_knee=(110, 112), far_ankle=(110, 137))
calf_raise_top = adjust(calf_raise_start, head=(118, 25), shoulder=(116, 42), hip=(114, 81),
                        elbow=(120, 65), hand=(121, 84), far_elbow=(113, 63), far_hand=(114, 82),
                        knee=(117, 104), far_knee=(111, 102), ankle=(117, 129), far_ankle=(110, 127))

# Motion, fixed equipment paths and hands holding weights.
DEMOS = {
    "squat": (rep(stand, squat), SQUAT_BENCH, ()),
    "bodySquat": (rep(stand, squat), (), ()),
    "gobletSquat": (rep(goblet_start, goblet_end), (), (4,)),
    "press": (rep(bench_press, adjust(bench_press, elbow=(102, 74), hand=(100, 49),
                                    far_elbow=(89, 73), far_hand=(86, 48))), BENCH, (4, 8)),
    "floorPress": (rep(floor_press, adjust(floor_press, elbow=(104, 110), hand=(104, 86),
                                         far_elbow=(91, 110), far_hand=(91, 85))), (), (4, 8)),
    "row": (rep(supported_row, adjust(supported_row, elbow=(110, 65), hand=(110, 88))),
            ROW_BENCH, (4,)),
    "wallPress": (rep(wall_push, adjust(wall_push, head=(158, 38), shoulder=(150, 55), hip=(128, 91),
                                      elbow=(153, 76), hand=(174, 58), knee=(113, 116),
                                      far_elbow=(150, 71), far_hand=(169, 57),
                                      far_knee=(107, 115))), WALL, ()),
    "pushup": (rep(floor_push, adjust(floor_push, head=(164, 109), shoulder=(152, 123),
                                    hip=(101, 130), knee=(74, 133), elbow=(126, 123),
                                    far_elbow=(119, 120), far_knee=(68, 132))), (), ()),
    "freeRow": (rep(bent_row, bent_row_top), (), (4, 8)),
    "singleFreeRow": (rep(bent_row, adjust(bent_row, elbow=(109, 66), hand=(114, 90))), (), (4,)),
    "proneW": (rep(prone, adjust(prone, elbow=(106, 129), hand=(84, 126),
                               far_elbow=(103, 95), far_hand=(81, 92))), (), ()),
    "rdl": (rep(stand, hinge_end), (), (4, 8)),
    "gluteBridge": (rep(bridge, adjust(bridge, hip=(126, 102), knee=(151, 101),
                                     far_knee=(144, 99))), (), ()),
    "shoulderPress": (rep(seated, adjust(seated, **press_up)), SEAT, (4, 8)),
    "standingPress": (rep(standing_press, adjust(standing_press, **press_up)), (), (4, 8)),
    "deadBug": ((dead_bug, adjust(dead_bug, elbow=(62, 116), hand=(40, 113),
                                 far_knee=(155, 124), far_ankle=(185, 125)),
                 dead_bug, adjust(dead_bug, far_elbow=(64, 120), far_hand=(42, 117),
                                  knee=(155, 129), ankle=(185, 130)), dead_bug), (), ()),
    "birdDog": ((bird_dog, adjust(bird_dog, elbow=(157, 90), hand=(180, 87),
                                 far_knee=(64, 93), far_ankle=(34, 91)),
                 bird_dog, adjust(bird_dog, far_elbow=(155, 87), far_hand=(178, 84),
                                  knee=(64, 96), ankle=(34, 94)), bird_dog), (), ()),
    "walk": ((walk_left, walk_center, walk_right, walk_center, walk_left), (), ()),
    "elliptical": (rep(elliptical_start, elliptical_end), ELLIPTICAL, ()),
    "barbellDeadlift": (rep(deadlift_start, adjust(stand, hand=(128, 95), far_hand=(120, 95))),
                        (), "barbell"),
    "barbellSquat": (rep(squat_bar, squat_bar_low), (), "barbell"),
    "barbellBenchPress": (rep(bar_press_top, bar_press_bottom), BENCH, "barbell"),
    "pullups": (rep(hang, pulled_up), PULL_UP_BAR, ()),
    "chinUp": (rep(adjust(hang, hand=(132, 25), far_hand=(106, 25), elbow=(128, 49),
                          far_elbow=(110, 49)),
                   adjust(pulled_up, hand=(132, 25), far_hand=(106, 25), elbow=(133, 58),
                          far_elbow=(105, 58), hip=(119, 71))), PULL_UP_BAR, ()),
    "ringMuscleUp": ((ring_hang, ring_pull, ring_dip_low, ring_dip_top, ring_dip_low,
                      ring_pull, ring_hang), RING_ANCHOR, ()),
    "obliqueCableCrunch": ((cable_kneel, cable_crunch, cable_kneel,
                             adjust(cable_crunch, elbow=(131, 114), far_elbow=(141, 122)),
                             cable_kneel), CABLE_TOWER, ()),
    "tricepsDips": (rep(dip, adjust(dip, head=(120, 47), shoulder=(114, 65), hip=(116, 106),
                                   elbow=(96, 75), far_elbow=(88, 73), knee=(122, 133),
                                   ankle=(99, 136), far_knee=(115, 131), far_ankle=(92, 134))),
                     DIP_BARS, ()),
    "plank": ((plank_kneeling, plank_hold, plank_hold, plank_hold, plank_kneeling), (), ()),
    "dumbbellCurl": (rep(stand, adjust(stand, hand=(128, 53), far_hand=(120, 50))), (), (4, 8)),
    "lateralRaise": (rep(lateral_raise, adjust(lateral_raise, elbow=(158, 54), hand=(181, 50),
                                              far_elbow=(80, 54), far_hand=(57, 50))), (), (4, 8)),
    "bodyRow": (rep(bent_row, bent_row_top), (), ()),
    "hipHinge": (rep(stand, hinge_end), (), ()),
    "shallowSquat": (rep(stand, pose(126, 47, 120, 62, 104, 98, 136, 71, 154, 69,
                                    128, 115, 117, 139)), (), ()),
    "quadStretch": (rep(adjust(stand, far_elbow=(135, 61), far_hand=(174, 59)),
                       quad_stretch), WALL, ()),
    "chestTricepsStretch": ((stand, chest_wall, adjust(chest_wall, shoulder=(110, 54),
                                                       head=(106, 37)), stand, triceps,
                             triceps, stand), WALL, ()),
    "wallBackStretch": (rep(wall_reach, adjust(wall_reach, head=(122, 70), shoulder=(111, 72),
                                              hip=(72, 83), elbow=(144, 65), far_elbow=(141, 64),
                                              knee=(85, 111), ankle=(90, 139),
                                              far_knee=(78, 109), far_ankle=(83, 139))), WALL, ()),
    "hamstringGluteStretch": ((bridge, lying_stretch,
                               adjust(lying_stretch, ankle=(139, 74)),
                               lying_stretch, adjust(lying_stretch, knee=(120, 101),
                                                     ankle=(155, 106), far_knee=(148, 98),
                                                     far_ankle=(160, 119)),
                               bridge), (), ()),
    "armCircles": (arm_circles, (), ()),
    "crossBodyStretch": (rep(arm_raise, adjust(stand, elbow=(110, 55), hand=(91, 54),
                                              far_elbow=(106, 78), far_hand=(109, 58))), (), ()),
    "armCurl": (rep(stand, adjust(stand, hand=(127, 54), far_hand=(120, 52))), (), ()),
    "wallBicepsStretch": (rep(adjust(reach, hand=(174, 56)),
                              adjust(reach, head=(103, 35), shoulder=(108, 52), elbow=(141, 57),
                                     hand=(174, 56))), WALL, ()),
    "wristMotion": ((reach, reach_up, reach, reach_down, reach), (), ()),
    "forearmStretch": ((reach, adjust(reach_up, far_elbow=(132, 72), far_hand=(158, 51)), reach,
                        adjust(reach_down, far_elbow=(133, 75), far_hand=(158, 63)), reach), (), ()),
    "calfRaise": (rep(wall_reach, adjust(wall_reach, head=(140, 26), shoulder=(133, 43),
                                       hip=(118, 79), knee=(108, 106), ankle=(101, 129),
                                       far_knee=(101, 104), far_ankle=(94, 127))), WALL, ()),
    "wallCalfStretch": (rep(calf_stretch, adjust(calf_stretch, head=(151, 39), shoulder=(143, 55),
                                                hip=(126, 86), knee=(140, 115),
                                                far_knee=(98, 113), elbow=(153, 62),
                                                far_elbow=(149, 61))), WALL, ()),
    "torsoTwist": ((twist, adjust(twist, head=(125, 35), elbow=(145, 68), hand=(139, 60),
                                  far_elbow=(111, 70), far_hand=(118, 64)), twist,
                    adjust(twist, head=(109, 35), elbow=(117, 69), hand=(107, 62),
                           far_elbow=(86, 70), far_hand=(95, 64)), twist), (), ()),
    "sideBend": (rep(adjust(stand, elbow=(126, 31), hand=(133, 14)),
                     adjust(stand, head=(104, 42), shoulder=(107, 57), elbow=(111, 33),
                            hand=(100, 15), far_elbow=(103, 79), far_hand=(103, 97))), (), ()),
    "splitSquatJump": ((split_landing, split_jump, swap_sides(split_landing),
                        swap_sides(split_jump), split_landing), (), ()),
    "dumbbellRearLunge": ((stand, rear_lunge, stand, swap_sides(rear_lunge), stand), (), (4, 8)),
    "barbellForwardLunge": (rep(squat_bar, forward_lunge), (), "barbell"),
    "cleanGripFrontSquat": (rep(front_rack, front_squat_low), (), "barbell"),
    "goodMorning": (rep(squat_bar, good_morning_low), (), "barbell"),
    "standingDumbbellCalfRaise": (rep(calf_raise_start, calf_raise_top), CALF_BOARD, (4, 8)),
    "abdominalCrunch": (rep(crunch_start, crunch_end), (), ()),
    "superman": ((superman_start, superman_top, superman_top, superman_start), (), ()),
    "singleLegBridge": (rep(single_bridge, single_bridge_top), (), ()),
    "mountainClimber": ((climber_left, floor_push, climber_right, floor_push, climber_left), (), ()),
    "concentrationCurl": (rep(concentration_curl, adjust(concentration_curl, hand=(121, 78))),
                          SEAT, (4,)),
    "dumbbellShrug": (rep(stand, adjust(stand, shoulder=(116, 43), elbow=(120, 66),
                                       hand=(121, 85), far_elbow=(113, 64), far_hand=(114, 83))),
                      (), (4, 8)),
    "alternatingFrontRaise": ((stand, adjust(stand, elbow=(141, 51), hand=(164, 47)),
                               stand, adjust(stand, far_elbow=(138, 49), far_hand=(160, 45)),
                               stand), (), (4, 8)),
    "dumbbellStepUp": ((stand, step_up_start, step_up_top, step_up_start, stand), STEP_BOX, (4, 8)),
}

def framing(motion, equipment):
    points = [joint for joints in motion for joint in joints]
    points.extend(point for path in equipment for point in path)
    x, y = zip(*points)
    scale = min(1.45, 216 / (max(x) - min(x) + 20), 142 / (max(y) - min(y) + 20))
    return ((min(x) + max(x)) / 2, (min(y) + max(y)) / 2, scale)


def render(joints, equipment, weights, frame):
    image = Image.new("RGB", (SIZE[0] * 2, SIZE[1] * 2), BACKGROUND)
    draw = ImageDraw.Draw(image)
    scale = image.width / 240
    center_x, center_y, zoom = frame

    def point(joint):
        x, y = joint
        return (round((120 + (x - center_x) * zoom) * scale),
                round((78 + (y - center_y) * zoom) * scale))

    def dot(center, radius, color):
        x, y = point(center)
        size = round(radius * scale * zoom)
        draw.ellipse((x - size, y - size, x + size, y + size), fill=color)

    def line(points, color, width):
        draw.line([point(joint) for joint in points], fill=color, width=round(width * scale * zoom))
        for joint in points:
            dot(joint, width / 2, color)

    if equipment != RING_ANCHOR:
        line(((center_x - 93 / zoom, 143), (center_x + 93 / zoom, 143)), "#506956", 2)
    for path in equipment:
        line(path, EQUIPMENT, 3)
    if equipment == RING_ANCHOR:
        for hand in (8, 4):
            hand_x, hand_y = joints[hand]
            line(((hand_x, 5), (hand_x, hand_y - 5)), EQUIPMENT, 2)
            dot((hand_x, hand_y), 6, EQUIPMENT)
            dot((hand_x, hand_y), 4, BACKGROUND)
    if equipment == CABLE_TOWER:
        line(((179, 30), joints[4]), EQUIPMENT, 2)
    if equipment == ELLIPTICAL:
        for hand, ankle in ((8, 10), (4, 6)):
            hand_x, hand_y = joints[hand]
            ankle_x, ankle_y = joints[ankle]
            line(((hand_x, hand_y - 6), (156, 89), (ankle_x, ankle_y + 4)), EQUIPMENT, 2)
            line(((ankle_x - 5, ankle_y + 4), (ankle_x + 12, ankle_y + 4)), EQUIPMENT, 3)
    for knee, ankle, color in ((9, 10, FAR), (5, 6, NEAR)):
        knee_x, _ = joints[knee]
        ankle_x, ankle_y = joints[ankle]
        toe_y = 141 if equipment != RING_ANCHOR and 126 <= ankle_y <= 141 else ankle_y + 2
        if equipment == CALF_BOARD:
            toe_y = 134
        toe_x = ankle_x + (9 if knee_x >= ankle_x - 3 else -9)
        line(((ankle_x, ankle_y), (toe_x, toe_y)), color, 4)
    for indices, color in (
        ((1, 7, 8), FAR), ((2, 9, 10), FAR), ((1, 2), NEAR),
        ((2, 5, 6), NEAR), ((1, 3, 4), NEAR),
    ):
        line(tuple(joints[index] for index in indices), color, 5 if color == FAR else 6)
    line((joints[0], joints[1]), NEAR, 5)
    dot(joints[0], 9, ACCENT)
    if weights == "barbell":
        x, y = joints[4]
        far_x, far_y = joints[8]
        left = min(x, far_x) - 10
        right = max(x, far_x) + 10
        bar_height = (y + far_y) / 2
        line(((left - 4, bar_height), (right + 4, bar_height)), ACCENT, 2)
        for end in (left, right):
            dot((end, bar_height), 5, ACCENT)
        return image.resize(SIZE, Image.Resampling.LANCZOS)
    for index in weights:
        x, y = joints[index]
        line(((x - 7, y), (x + 7, y)), ACCENT, 3)
        for end in (x - 6, x + 6):
            line(((end, y - 4), (end, y + 4)), ACCENT, 3)
    return image.resize(SIZE, Image.Resampling.LANCZOS)


def interpolate(start, end, fraction):
    eased = (1 - cos(pi * fraction)) / 2
    return tuple((x + (next_x - x) * eased, y + (next_y - y) * eased)
                 for (x, y), (next_x, next_y) in zip(start, end))


def save_demo(name, motion, equipment, weights):
    frames = []
    durations = []
    view = framing(motion, equipment)
    for start, end in zip(motion, motion[1:]):
        for frame in range(12):
            frames.append(render(interpolate(start, end, frame / 12), equipment, weights, view))
            durations.append(280 if frame == 0 else 65)
    frames[0].save(OUT / f"{name}.png", optimize=True)
    frames[0].save(OUT / f"{name}.gif", save_all=True, append_images=frames[1:],
                   duration=durations, loop=0, optimize=True)


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("demos", nargs="*", metavar="NAME", help="Render only the named demos.")
    names = parser.parse_args().demos
    unknown = sorted(set(names) - DEMOS.keys())
    if unknown:
        parser.error(f"Unknown demonstrations: {', '.join(unknown)}")
    OUT.mkdir(parents=True, exist_ok=True)
    for name in names or DEMOS:
        save_demo(name, *DEMOS[name])
