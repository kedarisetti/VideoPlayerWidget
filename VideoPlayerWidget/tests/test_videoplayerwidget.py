#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Dharanish Kedarisetti.
# Distributed under the terms of the Modified BSD License.

import pytest

from ..video import Video


def test_video_creation_blank():
    w = Video()
    assert w.videoTime == 0.0

def test_video_read_url():
    w = Video()
    test_url='https://iandevlin.github.io/mdn/video-player/video/tears-of-steel-battle-clip-medium.mp4'

    w.from_url(test_url)