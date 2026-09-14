/* Erzeugt von point-cloud-toolkit/tools/export_evidence.py. Nicht von Hand ändern — Quelle ist evidence.json.
 * Als klassisches Skript, damit die Daten auch nach einem Doppelklick auf
 * index.html zur Verfügung stehen: ab file:// ist fetch auf lokale Dateien
 * blockiert. */
(function (root) {
  root.PointCloudEvidence = {
 "schema": 1,
 "generated_by": "presentation/tools/export_evidence.py",
 "note": "Aggregated measurements from the thesis. Sanitized: no paths, no command lines, no logs, no raw data. The provenance of each block is in its `source` field, relative to the thesis repository.",
 "dales": {
  "id": "dales",
  "title": "DALES, the variant used in this project",
  "facts": {
   "Property": "Value",
   "Train scenes": "29",
   "Test scenes": "11",
   "Total scenes": "40",
   "Train points (PLY headers)": "368667682",
   "Test points (PLY headers)": "136643891",
   "Median points per scene": "12128541",
   "Stored attributes": "$x$, $y$, $z$, reflectance, class",
   "Semantic classes": "other, ground, vegetation, cars, trucks, power lines, fences, poles, buildings",
   "Role of \\textit{other} in this thesis": "Kept as an explicit target class instead of being ignored"
  },
  "class_names": [
   "other",
   "ground",
   "vegetation",
   "cars",
   "trucks",
   "power lines",
   "fences",
   "poles",
   "buildings"
  ],
  "source": "latex/generated/tables/dales_dataset_table.tex"
 },
 "results": {
  "id": "results",
  "title": "Six decompositions, four recomposition rules",
  "scenes": 11,
  "class_names": [
   "other",
   "ground",
   "vegetation",
   "cars",
   "trucks",
   "power lines",
   "fences",
   "poles",
   "buildings"
  ],
  "merges": [
   "majority",
   "distance",
   "confidence",
   "distance_confidence"
  ],
  "chunkers": {
   "xy": {
    "chunk_miou": 0.2647,
    "chunk_oa": 0.611,
    "chunk_tiles": 4751,
    "train_chunks": 12723,
    "val_chunks": 2036,
    "preprocess_hours": 5.21,
    "train_hours": 3.79,
    "chunk_test_hours": 4.8,
    "total_hours": 14.13,
    "trained_epochs": 6,
    "stop_reason": "early_stop_patience",
    "peak_gpu_mb": 19617.4,
    "preprocess_workers": 32,
    "best_merge": "confidence",
    "merges": {
     "majority": {
      "miou": 0.2523,
      "oa": 0.6504,
      "macc": 0.354,
      "per_class_iou": [
       0.0647,
       0.5691,
       0.4548,
       0.2893,
       0.0,
       0.1863,
       0.1983,
       0.1545,
       0.3542
      ],
      "duplicate_ratio": 0.4654,
      "mean_support": 1.5659,
      "max_support": 10,
      "merge_seconds": 91.01
     },
     "distance": {
      "miou": 0.2729,
      "oa": 0.6277,
      "macc": 0.3905,
      "per_class_iou": [
       0.0597,
       0.4852,
       0.4409,
       0.353,
       0.0,
       0.2316,
       0.2386,
       0.2,
       0.4474
      ],
      "duplicate_ratio": 0.4654,
      "mean_support": 1.5659,
      "max_support": 10,
      "merge_seconds": 106.55
     },
     "confidence": {
      "miou": 0.3112,
      "oa": 0.6961,
      "macc": 0.4276,
      "per_class_iou": [
       0.0642,
       0.5823,
       0.4945,
       0.4008,
       0.0,
       0.269,
       0.259,
       0.1989,
       0.5323
      ],
      "duplicate_ratio": 0.4654,
      "mean_support": 1.5659,
      "max_support": 10,
      "merge_seconds": 106.87
     },
     "distance_confidence": {
      "miou": 0.2776,
      "oa": 0.6368,
      "macc": 0.3948,
      "per_class_iou": [
       0.0593,
       0.4985,
       0.4472,
       0.3569,
       0.0,
       0.2374,
       0.2405,
       0.2001,
       0.4584
      ],
      "duplicate_ratio": 0.4654,
      "mean_support": 1.5659,
      "max_support": 10,
      "merge_seconds": 107.46
     }
    }
   },
   "morton": {
    "chunk_miou": 0.2687,
    "chunk_oa": 0.7102,
    "chunk_tiles": 3390,
    "train_chunks": 9145,
    "val_chunks": 1463,
    "preprocess_hours": 0.4,
    "train_hours": 10.85,
    "chunk_test_hours": 3.31,
    "total_hours": 14.81,
    "trained_epochs": 9,
    "stop_reason": "early_stop_patience",
    "peak_gpu_mb": 19609.8,
    "preprocess_workers": 32,
    "best_merge": "confidence",
    "merges": {
     "majority": {
      "miou": 0.2576,
      "oa": 0.6999,
      "macc": 0.3765,
      "per_class_iou": [
       0.0619,
       0.6366,
       0.4043,
       0.2736,
       0.0,
       0.2319,
       0.1514,
       0.1451,
       0.4137
      ],
      "duplicate_ratio": 0.1143,
      "mean_support": 1.1166,
      "max_support": 6,
      "merge_seconds": 61.6
     },
     "distance": {
      "miou": 0.2716,
      "oa": 0.7129,
      "macc": 0.3967,
      "per_class_iou": [
       0.0983,
       0.648,
       0.4305,
       0.2827,
       0.0,
       0.2445,
       0.1545,
       0.1492,
       0.4369
      ],
      "duplicate_ratio": 0.1143,
      "mean_support": 1.1166,
      "max_support": 6,
      "merge_seconds": 77.02
     },
     "confidence": {
      "miou": 0.2766,
      "oa": 0.7234,
      "macc": 0.3997,
      "per_class_iou": [
       0.0602,
       0.657,
       0.4513,
       0.2904,
       0.0,
       0.2551,
       0.1618,
       0.156,
       0.4579
      ],
      "duplicate_ratio": 0.1143,
      "mean_support": 1.1166,
      "max_support": 6,
      "merge_seconds": 77.66
     },
     "distance_confidence": {
      "miou": 0.2725,
      "oa": 0.7141,
      "macc": 0.3973,
      "per_class_iou": [
       0.0984,
       0.649,
       0.4335,
       0.2831,
       0.0,
       0.245,
       0.1549,
       0.1497,
       0.4386
      ],
      "duplicate_ratio": 0.1143,
      "mean_support": 1.1166,
      "max_support": 6,
      "merge_seconds": 77.75
     }
    }
   },
   "kdtree": {
    "chunk_miou": 0.567,
    "chunk_oa": 0.9418,
    "chunk_tiles": 5632,
    "train_chunks": 14848,
    "val_chunks": 2376,
    "preprocess_hours": 5.9,
    "train_hours": 14.45,
    "chunk_test_hours": 5.48,
    "total_hours": 26.16,
    "trained_epochs": 11,
    "stop_reason": "early_stop_patience",
    "peak_gpu_mb": 19614.5,
    "preprocess_workers": 32,
    "best_merge": "distance_confidence",
    "merges": {
     "majority": {
      "miou": 0.5523,
      "oa": 0.9465,
      "macc": 0.7061,
      "per_class_iou": [
       0.1134,
       0.943,
       0.888,
       0.594,
       0.0147,
       0.6826,
       0.3569,
       0.4964,
       0.8819
      ],
      "duplicate_ratio": 0.6594,
      "mean_support": 1.862,
      "max_support": 8,
      "merge_seconds": 91.38
     },
     "distance": {
      "miou": 0.5549,
      "oa": 0.9441,
      "macc": 0.7061,
      "per_class_iou": [
       0.1183,
       0.9376,
       0.8882,
       0.5894,
       0.0142,
       0.718,
       0.3488,
       0.515,
       0.865
      ],
      "duplicate_ratio": 0.6594,
      "mean_support": 1.862,
      "max_support": 8,
      "merge_seconds": 104.23
     },
     "confidence": {
      "miou": 0.5549,
      "oa": 0.9454,
      "macc": 0.7048,
      "per_class_iou": [
       0.1181,
       0.94,
       0.8881,
       0.5885,
       0.0126,
       0.7149,
       0.3484,
       0.5131,
       0.8708
      ],
      "duplicate_ratio": 0.6594,
      "mean_support": 1.862,
      "max_support": 8,
      "merge_seconds": 105.6
     },
     "distance_confidence": {
      "miou": 0.5552,
      "oa": 0.9442,
      "macc": 0.706,
      "per_class_iou": [
       0.1187,
       0.9378,
       0.8882,
       0.5891,
       0.014,
       0.7187,
       0.3493,
       0.5156,
       0.8654
      ],
      "duplicate_ratio": 0.6594,
      "mean_support": 1.862,
      "max_support": 8,
      "merge_seconds": 106.54
     }
    }
   },
   "rand_knn": {
    "chunk_miou": 0.3393,
    "chunk_oa": 0.7004,
    "chunk_tiles": 8014,
    "train_chunks": 21713,
    "val_chunks": 3474,
    "preprocess_hours": 2.02,
    "train_hours": 23.41,
    "chunk_test_hours": 7.92,
    "total_hours": 33.83,
    "trained_epochs": 12,
    "stop_reason": "early_stop_patience",
    "peak_gpu_mb": 20204.4,
    "preprocess_workers": 32,
    "best_merge": "confidence",
    "merges": {
     "majority": {
      "miou": 0.2848,
      "oa": 0.6729,
      "macc": 0.3729,
      "per_class_iou": [
       0.1045,
       0.6067,
       0.3628,
       0.3327,
       0.0764,
       0.2768,
       0.242,
       0.2135,
       0.3479
      ],
      "duplicate_ratio": 0.9131,
      "mean_support": 2.6365,
      "max_support": 12,
      "merge_seconds": 137.06
     },
     "distance": {
      "miou": 0.3673,
      "oa": 0.7451,
      "macc": 0.4617,
      "per_class_iou": [
       0.0917,
       0.6655,
       0.5068,
       0.4392,
       0.1054,
       0.3892,
       0.3048,
       0.3089,
       0.494
      ],
      "duplicate_ratio": 0.9131,
      "mean_support": 2.6365,
      "max_support": 12,
      "merge_seconds": 152.96
     },
     "confidence": {
      "miou": 0.4779,
      "oa": 0.8561,
      "macc": 0.5791,
      "per_class_iou": [
       0.084,
       0.7888,
       0.737,
       0.5678,
       0.0988,
       0.5381,
       0.4094,
       0.4056,
       0.6714
      ],
      "duplicate_ratio": 0.9131,
      "mean_support": 2.6365,
      "max_support": 12,
      "merge_seconds": 153.73
     },
     "distance_confidence": {
      "miou": 0.3857,
      "oa": 0.7638,
      "macc": 0.4816,
      "per_class_iou": [
       0.0927,
       0.6835,
       0.5446,
       0.4624,
       0.1072,
       0.4135,
       0.319,
       0.3237,
       0.5249
      ],
      "duplicate_ratio": 0.9131,
      "mean_support": 2.6365,
      "max_support": 12,
      "merge_seconds": 153.68
     }
    }
   },
   "rand_cyl": {
    "chunk_miou": 0.3157,
    "chunk_oa": 0.5589,
    "chunk_tiles": 7369,
    "train_chunks": 19831,
    "val_chunks": 3173,
    "preprocess_hours": 1.78,
    "train_hours": 25.28,
    "chunk_test_hours": 7.2,
    "total_hours": 34.69,
    "trained_epochs": 14,
    "stop_reason": "early_stop_patience",
    "peak_gpu_mb": 19947.4,
    "preprocess_workers": 32,
    "best_merge": "confidence",
    "merges": {
     "majority": {
      "miou": 0.3678,
      "oa": 0.6512,
      "macc": 0.5236,
      "per_class_iou": [
       0.0804,
       0.5952,
       0.5513,
       0.4298,
       0.1037,
       0.4681,
       0.3554,
       0.389,
       0.3374
      ],
      "duplicate_ratio": 0.898,
      "mean_support": 2.4272,
      "max_support": 10,
      "merge_seconds": 128.31
     },
     "distance": {
      "miou": 0.3277,
      "oa": 0.5878,
      "macc": 0.4664,
      "per_class_iou": [
       0.0806,
       0.5109,
       0.4885,
       0.3855,
       0.0904,
       0.4171,
       0.3104,
       0.3681,
       0.2979
      ],
      "duplicate_ratio": 0.898,
      "mean_support": 2.4272,
      "max_support": 10,
      "merge_seconds": 140.8
     },
     "confidence": {
      "miou": 0.4555,
      "oa": 0.7716,
      "macc": 0.6053,
      "per_class_iou": [
       0.0884,
       0.7325,
       0.7035,
       0.5224,
       0.1229,
       0.5987,
       0.421,
       0.468,
       0.4421
      ],
      "duplicate_ratio": 0.898,
      "mean_support": 2.4272,
      "max_support": 10,
      "merge_seconds": 140.87
     },
     "distance_confidence": {
      "miou": 0.341,
      "oa": 0.6077,
      "macc": 0.4798,
      "per_class_iou": [
       0.0814,
       0.5327,
       0.5157,
       0.3992,
       0.0922,
       0.4387,
       0.3198,
       0.381,
       0.3082
      ],
      "duplicate_ratio": 0.898,
      "mean_support": 2.4272,
      "max_support": 10,
      "merge_seconds": 142.77
     }
    }
   },
   "bisect_xy_overlap": {
    "chunk_miou": 0.3106,
    "chunk_oa": 0.4765,
    "chunk_tiles": 5135,
    "train_chunks": 13745,
    "val_chunks": 2199,
    "preprocess_hours": 5.45,
    "train_hours": 14.18,
    "chunk_test_hours": 5.01,
    "total_hours": 24.98,
    "trained_epochs": 11,
    "stop_reason": "early_stop_patience",
    "peak_gpu_mb": 19613.1,
    "preprocess_workers": 32,
    "best_merge": "confidence",
    "merges": {
     "majority": {
      "miou": 0.2306,
      "oa": 0.366,
      "macc": 0.3343,
      "per_class_iou": [
       0.006,
       0.3657,
       0.3548,
       0.313,
       0.0,
       0.2713,
       0.226,
       0.1982,
       0.3401
      ],
      "duplicate_ratio": 0.5436,
      "mean_support": 1.6914,
      "max_support": 8,
      "merge_seconds": 91.39
     },
     "distance": {
      "miou": 0.3169,
      "oa": 0.5039,
      "macc": 0.4266,
      "per_class_iou": [
       0.0066,
       0.4959,
       0.4919,
       0.4208,
       0.0,
       0.3777,
       0.2942,
       0.2804,
       0.4843
      ],
      "duplicate_ratio": 0.5436,
      "mean_support": 1.6914,
      "max_support": 8,
      "merge_seconds": 108.23
     },
     "confidence": {
      "miou": 0.3817,
      "oa": 0.6159,
      "macc": 0.5034,
      "per_class_iou": [
       0.0084,
       0.6064,
       0.5998,
       0.5018,
       0.0,
       0.4549,
       0.3503,
       0.3234,
       0.59
      ],
      "duplicate_ratio": 0.5436,
      "mean_support": 1.6914,
      "max_support": 8,
      "merge_seconds": 108.87
     },
     "distance_confidence": {
      "miou": 0.3305,
      "oa": 0.528,
      "macc": 0.4413,
      "per_class_iou": [
       0.0069,
       0.5199,
       0.5151,
       0.4366,
       0.0,
       0.3941,
       0.3051,
       0.2893,
       0.5077
      ],
      "duplicate_ratio": 0.5436,
      "mean_support": 1.6914,
      "max_support": 8,
      "merge_seconds": 108.47
     }
    }
   }
  },
  "source": [
   "data/.<chunker>_metadata.json",
   "data/<chunker>/test_runs/model_best/chunk_test_metrics.json",
   "data/<chunker>/test_runs/model_best/recomposed_test/<scene>/<merge>_metrics.json"
  ]
 },
 "confusion": {
  "id": "confusion",
  "title": "Confusions at scene level",
  "class_names": [
   "other",
   "ground",
   "vegetation",
   "cars",
   "trucks",
   "power lines",
   "fences",
   "poles",
   "buildings"
  ],
  "per_chunker": {
   "xy": {
    "merge": "confidence",
    "matrix": [
     [
      48580,
      74779,
      390202,
      33888,
      53,
      1860,
      23931,
      710,
      107506
     ],
     [
      100667,
      40720063,
      26305664,
      1081,
      0,
      2,
      1214,
      0,
      1728702
     ],
     [
      107703,
      862366,
      39372974,
      150251,
      155,
      277641,
      175687,
      2791,
      512580
     ],
     [
      2847,
      7607,
      456760,
      550294,
      17,
      2,
      4096,
      45,
      48793
     ],
     [
      1362,
      1139,
      71160,
      27637,
      0,
      0,
      1493,
      0,
      51333
     ],
     [
      544,
      3,
      98999,
      15,
      0,
      128732,
      470,
      729,
      912
     ],
     [
      2167,
      3592,
      346050,
      5270,
      0,
      1585,
      247793,
      174,
      17401
     ],
     [
      148,
      39,
      52779,
      384,
      0,
      16174,
      4827,
      17902,
      461
     ],
     [
      20450,
      137252,
      9067006,
      11695,
      0,
      4088,
      56470,
      259,
      14153503
     ]
    ]
   },
   "morton": {
    "merge": "confidence",
    "matrix": [
     [
      58933,
      387663,
      31818,
      104582,
      77,
      1154,
      42409,
      1134,
      53740
     ],
     [
      344542,
      67366499,
      131693,
      31761,
      29021,
      341,
      6453,
      0,
      947082
     ],
     [
      89762,
      20984640,
      18868053,
      479459,
      1469,
      38878,
      562294,
      23616,
      413978
     ],
     [
      673,
      492017,
      7026,
      543383,
      278,
      3,
      16214,
      90,
      10777
     ],
     [
      160,
      67525,
      1668,
      40433,
      1,
      5,
      6256,
      87,
      37989
     ],
     [
      0,
      112966,
      31516,
      435,
      6,
      80733,
      780,
      2723,
      1245
     ],
     [
      302,
      312176,
      24174,
      18603,
      54,
      731,
      262928,
      639,
      4425
     ],
     [
      0,
      51044,
      3409,
      1327,
      16,
      10446,
      3991,
      19070,
      3411
     ],
     [
      22401,
      11356239,
      106929,
      115402,
      4096,
      2201,
      288996,
      1941,
      11552517
     ]
    ]
   },
   "kdtree": {
    "merge": "distance_confidence",
    "matrix": [
     [
      175909,
      161222,
      112905,
      75679,
      3168,
      1844,
      54662,
      1650,
      94471
     ],
     [
      209548,
      66932356,
      113482,
      4504,
      0,
      0,
      8583,
      0,
      1588919
     ],
     [
      408618,
      2037468,
      37545217,
      368221,
      6816,
      1919,
      571284,
      5369,
      517237
     ],
     [
      13496,
      11098,
      18881,
      972792,
      655,
      7,
      8123,
      92,
      45317
     ],
     [
      11426,
      1315,
      7975,
      59730,
      2866,
      0,
      5120,
      0,
      65692
     ],
     [
      78,
      2,
      4273,
      9,
      0,
      216210,
      498,
      7423,
      1911
     ],
     [
      19124,
      7707,
      45332,
      15596,
      96,
      1834,
      508716,
      1537,
      24090
     ],
     [
      371,
      77,
      19286,
      691,
      50,
      7850,
      4856,
      56690,
      2843
     ],
     [
      151081,
      252923,
      266902,
      50705,
      1286,
      291,
      116110,
      24,
      22611400
     ]
    ]
   },
   "rand_knn": {
    "merge": "confidence",
    "matrix": [
     [
      95226,
      345859,
      117350,
      23780,
      13319,
      2110,
      23562,
      978,
      59326
     ],
     [
      119009,
      66691853,
      172401,
      3389,
      2,
      0,
      4370,
      0,
      1866368
     ],
     [
      176361,
      9324281,
      31187123,
      203452,
      23160,
      2018,
      194932,
      3840,
      346982
     ],
     [
      4783,
      221567,
      12884,
      802025,
      3293,
      5,
      2621,
      92,
      23191
     ],
     [
      8181,
      40191,
      5578,
      47232,
      25431,
      0,
      2373,
      0,
      25138
     ],
     [
      5,
      65819,
      4680,
      5,
      1,
      151539,
      615,
      3521,
      4219
     ],
     [
      14192,
      154674,
      42572,
      6630,
      283,
      1526,
      388374,
      873,
      14908
     ],
     [
      270,
      23426,
      12377,
      511,
      55,
      5569,
      977,
      41862,
      7667
     ],
     [
      76394,
      5416550,
      237945,
      29111,
      25933,
      346,
      54354,
      30,
      17610059
     ]
    ]
   },
   "rand_cyl": {
    "merge": "confidence",
    "matrix": [
     [
      190258,
      47980,
      73961,
      44795,
      13142,
      1730,
      12802,
      1127,
      295714
     ],
     [
      692218,
      51385136,
      134619,
      1942,
      2,
      2,
      683,
      0,
      16642791
     ],
     [
      505626,
      1064351,
      29534036,
      256692,
      12617,
      1066,
      109397,
      5441,
      9972923
     ],
     [
      4789,
      7588,
      5431,
      794436,
      2537,
      4,
      826,
      94,
      254756
     ],
     [
      11043,
      847,
      2666,
      55308,
      35667,
      0,
      1215,
      0,
      47378
     ],
     [
      480,
      1,
      2540,
      18,
      3,
      170895,
      727,
      3937,
      51803
     ],
     [
      20255,
      3287,
      42799,
      8948,
      125,
      917,
      345319,
      329,
      202053
     ],
     [
      743,
      57,
      12339,
      462,
      71,
      4800,
      616,
      48286,
      25340
     ],
     [
      135812,
      247839,
      165423,
      42953,
      50143,
      363,
      31785,
      80,
      22776324
     ]
    ]
   },
   "bisect_xy_overlap": {
    "merge": "confidence",
    "matrix": [
     [
      411953,
      68946,
      129660,
      10701,
      0,
      2297,
      18259,
      1489,
      38204
     ],
     [
      25068824,
      42449758,
      713897,
      1168,
      0,
      0,
      1199,
      0,
      622547
     ],
     [
      14717949,
      678025,
      25592036,
      91497,
      1,
      4141,
      156649,
      8662,
      213188
     ],
     [
      390128,
      4650,
      29274,
      628840,
      0,
      92,
      2801,
      31,
      14645
     ],
     [
      79424,
      1179,
      8740,
      27880,
      0,
      20,
      2012,
      44,
      34825
     ],
     [
      78645,
      1,
      1501,
      2,
      0,
      147047,
      320,
      2191,
      697
     ],
     [
      243206,
      2093,
      46324,
      3961,
      0,
      2630,
      318743,
      1846,
      5229
     ],
     [
      33731,
      42,
      10739,
      442,
      0,
      9437,
      427,
      36892,
      1004
     ],
     [
      8301657,
      347874,
      197442,
      16784,
      2,
      2392,
      59173,
      2172,
      14523227
     ]
    ]
   }
  },
  "source": "data/<chunker>/test_runs/model_best/recomposed_test/<scene>/<merge>_confusion.csv"
 },
 "knn_backends": {
  "id": "knn_backends",
  "title": "kNN backends under a memory limit",
  "problem": "The two centre-based chunkers need a neighbour search across the whole scene. One global k-d tree over twelve million points per scene blows the memory budget of the machine as soon as 24 workers run in parallel.",
  "investigation": "8 interchangeable backends behind the same interface, each under a RAM guard with a 60 GB limit, 24 workers and a point budget of 30,000. When a run crosses the limit the guard terminates the whole process group (return code -15) instead of driving the machine into swap.",
  "result": "3 of 8 backends crossed the limit and were killed, the whole-scene k-d tree among them. 5 finished, with runtimes between 23 and 72 minutes - and only 2 of those search exactly.",
  "decision": "faiss_cpu is the library default: FAISS was the only exact search that stayed inside the limit (49.92 GB, CPU and GPU variant level with each other) - the k-d tree, the otherwise obvious exact choice, was killed. Cheaper and faster was morton (47.40 GB, 23 min), but as a rank window over Z-order it is an approximation: it shifts which points end up in a chunk. The approximations stay selectable; the default searches exactly.",
  "chosen": "faiss_cpu",
  "cheapest": "morton",
  "limit_gb": 60.0,
  "workers": 24,
  "point_max": 30000,
  "rows": [
   {
    "backend": "kdtree",
    "strategy": "rand_knn",
    "status": "too_large",
    "exceeded_limit": true,
    "ram_peak_gb": 60.13,
    "duration_minutes": 16.1,
    "search": "exact"
   },
   {
    "backend": "local_kdtree",
    "strategy": "rand_knn",
    "status": "ok",
    "exceeded_limit": false,
    "ram_peak_gb": 52.49,
    "duration_minutes": 24.5,
    "search": "approximate"
   },
   {
    "backend": "lsh",
    "strategy": "rand_knn",
    "status": "ok",
    "exceeded_limit": false,
    "ram_peak_gb": 59.12,
    "duration_minutes": 55.9,
    "search": "approximate"
   },
   {
    "backend": "annoy",
    "strategy": "rand_knn",
    "status": "too_large",
    "exceeded_limit": true,
    "ram_peak_gb": 60.19,
    "duration_minutes": 57.2,
    "search": "approximate"
   },
   {
    "backend": "faiss_cpu",
    "strategy": "rand_knn",
    "status": "ok",
    "exceeded_limit": false,
    "ram_peak_gb": 49.92,
    "duration_minutes": 72.4,
    "search": "exact"
   },
   {
    "backend": "faiss_gpu",
    "strategy": "rand_knn",
    "status": "ok",
    "exceeded_limit": false,
    "ram_peak_gb": 49.93,
    "duration_minutes": 72.2,
    "search": "exact"
   },
   {
    "backend": "pynndescent",
    "strategy": "rand_knn",
    "status": "too_large",
    "exceeded_limit": true,
    "ram_peak_gb": 60.01,
    "duration_minutes": 14.4,
    "search": "approximate"
   },
   {
    "backend": "morton",
    "strategy": "rand_knn",
    "status": "ok",
    "exceeded_limit": false,
    "ram_peak_gb": 47.4,
    "duration_minutes": 23.1,
    "search": "approximate"
   }
  ],
  "source": "latex/assets/pre_delete_backup/ram_guard_summary.json"
 },
 "parallel_scaling": {
  "id": "parallel_scaling",
  "title": "Parallel scaling of both pipeline halves",
  "problem": "Scenes are independent of one another, so process parallelism suggests itself. The question is whether it holds up - or whether shared memory and disk I/O eat it.",
  "investigation": "The same pilot for both halves: decomposing 2 scenes with xy at a budget of 45,000, and recomposing 4 scenes of 512 chunks each with the confidence rule - with 1, 2 and 4 workers in each case.",
  "result": "Recomposition scales almost linearly: 3.63x at 4 workers, 91 % efficiency. Decomposition stalls at 1.88x - with only two scenes, four workers cannot be kept busy.",
  "decision": "Scene-parallel execution with one worker per scene, plus the point budget and `gc_every_tiles` as memory brakes. The measurement also shows the limit of the approach: more workers than scenes buys nothing.",
  "preprocess": {
   "chunker": "xy",
   "point_max": 45000,
   "scenes": 2,
   "tiles": 826,
   "rows": [
    {
     "workers": 1,
     "wall_minutes": 45.5,
     "speedup": 1.0,
     "efficiency": 1.0
    },
    {
     "workers": 2,
     "wall_minutes": 24.1,
     "speedup": 1.88,
     "efficiency": 0.942
    },
    {
     "workers": 4,
     "wall_minutes": 24.2,
     "speedup": 1.88,
     "efficiency": 0.471
    }
   ]
  },
  "recompose": {
   "chunker": "kdtree",
   "merge_method": "confidence",
   "scenes": 4,
   "tiles_per_scene": 512,
   "points_total": 47801644,
   "rows": [
    {
     "workers": 1,
     "wall_minutes": 4.4,
     "speedup": 1.0,
     "efficiency": 1.0
    },
    {
     "workers": 2,
     "wall_minutes": 2.2,
     "speedup": 2.02,
     "efficiency": 1.011
    },
    {
     "workers": 4,
     "wall_minutes": 1.2,
     "speedup": 3.63,
     "efficiency": 0.908
    }
   ]
  },
  "source": "data/pilot_parallel_scaling/pilot_parallel_scaling_summary.json"
 },
 "budget_probe": {
  "id": "budget_probe",
  "title": "Automatic search for the largest point budget",
  "problem": "The point budget per chunk governs GPU memory and available context at the same time. Rather than guess it, a search was meant to find the largest budget that does not yet run out of memory.",
  "investigation": "One probe run per candidate with 300 training steps on 2 GPUs, accompanied by a memory monitor recording peak and steady usage per card.",
  "result": "It failed. The first candidate aborted with return code 1 - not on an out-of-memory error but on the probe configuration itself (`best_safe_point_max: null`). The measured 1832 MB peak usage shows the budget never touched the limit.",
  "decision": "The automation was dropped. The point budget was derived per chunker family from the density statistic and held against the observed GPU peak usage of the real training runs. The failed attempt stays documented because it explains the decision.",
  "outcome": "failed",
  "best_safe_point_max": null,
  "first_failing_point_max": 9000,
  "attempts": [
   {
    "point_max": 9000,
    "ok": false,
    "out_of_memory": false,
    "reason": "failed_rc_1",
    "peak_gpu_mb": 1832.0
   }
  ],
  "source": "latex/assets/pre_delete_backup/summary.json"
 }
};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PointCloudEvidence;
})(typeof globalThis !== 'undefined' ? globalThis : this);
