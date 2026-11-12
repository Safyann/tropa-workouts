"""Render the local exercise demonstrations. Run with Python and Pillow."""
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

elliptical_start = pose(122, 33, 118, 50, 109, 88, 139, 70, 160, 62, 132, 106, 138, 125,
                        134, 66, 148, 52, 101, 108, 84, 134)
elliptical_end = adjust(elliptical_start, elbow=(134, 66), hand=(148, 52), knee=(101, 108),
                        ankle=(84, 134), far_elbow=(139, 70), far_hand=(160, 62),
                        far_knee=(132, 106), far_ankle=(138, 125))

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

    line(((center_x - 93 / zoom, 143), (center_x + 93 / zoom, 143)), "#506956", 2)
    for path in equipment:
        line(path, EQUIPMENT, 3)
    if equipment == ELLIPTICAL:
        for hand, ankle in ((8, 10), (4, 6)):
            hand_x, hand_y = joints[hand]
            ankle_x, ankle_y = joints[ankle]
            line(((hand_x, hand_y - 6), (156, 89), (ankle_x, ankle_y + 4)), EQUIPMENT, 2)
            line(((ankle_x - 5, ankle_y + 4), (ankle_x + 12, ankle_y + 4)), EQUIPMENT, 3)
    for knee, ankle, color in ((9, 10, FAR), (5, 6, NEAR)):
        knee_x, _ = joints[knee]
        ankle_x, ankle_y = joints[ankle]
        toe_y = 141 if ankle_y >= 126 else ankle_y + 2
        toe_x = ankle_x + (9 if knee_x >= ankle_x - 3 else -9)
        line(((ankle_x, ankle_y), (toe_x, toe_y)), color, 4)
    for indices, color in (
        ((1, 7, 8), FAR), ((2, 9, 10), FAR), ((1, 2), NEAR),
        ((2, 5, 6), NEAR), ((1, 3, 4), NEAR),
    ):
        line(tuple(joints[index] for index in indices), color, 5 if color == FAR else 6)
    line((joints[0], joints[1]), NEAR, 5)
    dot(joints[0], 9, ACCENT)
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
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (motion, equipment, weights) in DEMOS.items():
        save_demo(name, motion, equipment, weights)
