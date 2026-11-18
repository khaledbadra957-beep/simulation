# Hand model tools (Blender)

`hand-model.js` holds the 3-D hand the camera labs draw. It was rebuilt with these scripts.

- `handio.py` reads and writes the `hand-model.js` format (quantised positions and normals, triangles,
  four bone weights per vertex, nail marks, the 20 bones and the 21 rest points the tracker uses).
- `build_hand.py` loads a hand, cuts off the wrist stump and grows a tapered forearm, builds a 20-bone
  skeleton on the 21 tracked points, lets Blender compute bone-heat skin weights, smooths them, and
  keeps the four strongest bones per vertex.

Run it with Blender's Python module (no Blender window needed):

```bash
python -m venv bl && bl/bin/pip install bpy numpy
```

```bash
cd tools/blender && ../../bl/bin/python build_hand.py ../../hand-model.js ../../hand-model.new.js
```

`build_hand.py` expects the original hand (without a forearm) as input; run it on
`git show 131a450:hand-model.js` rather than on its own output.
