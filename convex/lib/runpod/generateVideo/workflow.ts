import { nanoid } from "@/lib/nanoid";

type Params = {
  imageUrl: string,
  durationS: number,
  prompt: string,
  outputDimensions?: { width: number, height: number },
  fps?: number,
}

export const compileWorkflow = ({ imageUrl, durationS, prompt, outputDimensions, fps }: Params) => {
  const randomId = nanoid();

  return {
    "157": {
      "inputs": {
        "value": prompt.trim(),
      },
      "class_type": "PrimitiveStringMultiline",
      "_meta": {
        "title": "Own Final Prompt (switch OFF ollama to use)"
      }
    },
    "247": {
      "inputs": {
        "value": durationS
      },
      "class_type": "PrimitiveInt",
      "_meta": {
        "title": "Clip length in seconds"
      }
    },
    "248": {
      "inputs": {
        "value": 24
      },
      "class_type": "PrimitiveInt",
      "_meta": {
        "title": "FPS"
      }
    },
    "345": {
      "inputs": {
        "lora_name": "ltx-2-19b-ic-lora-detailer.safetensors",
        "strength_model": 1,
        "model": [
          "533",
          0
        ]
      },
      "class_type": "LoraLoaderModelOnly",
      "_meta": {
        "title": "LoraLoaderModelOnly"
      }
    },
    "349": {
      "inputs": {
        "lora_name": "ltx-2-19b-ic-lora-detailer.safetensors",
        "strength_model": 0.9,
        "model": [
          "408",
          0
        ]
      },
      "class_type": "LoraLoaderModelOnly",
      "_meta": {
        "title": "LoraLoaderModelOnly"
      }
    },
    "392": {
      "inputs": {
        "model_name": "ltx-2.3-spatial-upscaler-x2-1.1.safetensors"
      },
      "class_type": "LatentUpscaleModelLoader",
      "_meta": {
        "title": "Charger le Modèle d'Agrandissement Latent"
      }
    },
    "405": {
      "inputs": {
        "vae_name": "LTX23_video_vae_bf16.safetensors",
        "device": "main_device",
        "weight_dtype": "bf16"
      },
      "class_type": "VAELoaderKJ",
      "_meta": {
        "title": "VAELoader KJ Video"
      }
    },
    "406": {
      "inputs": {
        "vae_name": "LTX23_audio_vae_bf16.safetensors",
        "device": "main_device",
        "weight_dtype": "bf16"
      },
      "class_type": "VAELoaderKJ",
      "_meta": {
        "title": "VAELoader KJ Audio"
      }
    },
    "407": {
      "inputs": {
        "clip_name1": "gemma_3_12B_it_fp4_mixed.safetensors",
        "clip_name2": "ltx-2.3_text_projection_bf16.safetensors",
        "type": "ltxv",
        "device": "default"
      },
      "class_type": "DualCLIPLoader",
      "_meta": {
        "title": "ChargeurDualCLIP"
      }
    },
    "408": {
      "inputs": {
        "unet_name": "ltx-2-3-22b-dev_transformer_only_fp8_input_scaled.safetensors",
        "weight_dtype": "default"
      },
      "class_type": "UNETLoader",
      "_meta": {
        "title": "Charger Modèle Diffusion"
      }
    },
    "511": {
      "inputs": {
        "modality": "AUDIO",
        "cfg": 7,
        "stg": 1,
        "perturb_attn": true,
        "rescale": 0.7,
        "modality_scale": 3,
        "skip_step": 0,
        "cross_attn": true
      },
      "class_type": "GuiderParameters",
      "_meta": {
        "title": "🅛🅣🅧 Guider Parameters"
      }
    },
    "519": {
      "inputs": {
        "steps": [
          "577:573",
          0
        ],
        "max_shift": 2.05,
        "base_shift": 0.95,
        "stretch": true,
        "terminal": 0.42,
        "latent": [
          "577:541",
          0
        ]
      },
      "class_type": "LTXVScheduler",
      "_meta": {
        "title": "LTXVScheduler"
      }
    },
    "520": {
      "inputs": {
        "skip_blocks": "28",
        "model": [
          "349",
          0
        ],
        "positive": [
          "577:566",
          0
        ],
        "negative": [
          "577:566",
          1
        ],
        "parameters": [
          "522",
          0
        ]
      },
      "class_type": "MultimodalGuider",
      "_meta": {
        "title": "🅛🅣🅧 Multimodal Guider"
      }
    },
    "522": {
      "inputs": {
        "modality": "VIDEO",
        "cfg": [
          "577:574",
          0
        ],
        "stg": 1,
        "perturb_attn": true,
        "rescale": 0.9,
        "modality_scale": 3,
        "skip_step": 0,
        "cross_attn": true,
        "parameters": [
          "511",
          0
        ]
      },
      "class_type": "GuiderParameters",
      "_meta": {
        "title": "🅛🅣🅧 Guider Parameters (Def settings) MM"
      }
    },
    "533": {
      "inputs": {
        "lora_name": "ltx-2.3-22b-distilled-lora-dynamic_fro09_avg_rank_105_bf16.safetensors",
        "strength_model": 0.6,
        "model": [
          "408",
          0
        ]
      },
      "class_type": "LoraLoaderModelOnly",
      "_meta": {
        "title": "Load Distilled Lora Upscaler"
      }
    },
    "583": {
      "inputs": {
        "resize_type": "target dimensions",
        "resize_type.width": outputDimensions?.width || 1080,
        "resize_type.height": outputDimensions?.height || 1920,
        "quality": "ULTRA",
        "images": [
          "588",
          0
        ]
      },
      "class_type": "RTXVideoSuperResolution",
      "_meta": {
        "title": "RTX Video Super Resolution"
      }
    },
    "584": {
      "inputs": {
        "aspect_ratio": "9:16",
        "proportional_width": 1,
        "proportional_height": 1,
        "fit": "crop",
        "method": "lanczos",
        "round_to_multiple": "8",
        "scale_to_side": "longest",
        "scale_to_length": 1536,
        "background_color": "#000000",
        "image": [
          "602",
          0
        ]
      },
      "class_type": "LayerUtility: ImageScaleByAspectRatio V2",
      "_meta": {
        "title": "LayerUtility: Mise à l'échelle proportionnelle_V2"
      }
    },
    "588": {
      "inputs": {
        "source_fps": [
          "615",
          0
        ],
        "target_fps": [
          "607",
          0
        ],
        "scale": 1,
        "model_name": "flownet.pkl",
        "batch_size": 8,
        "use_fp16": true,
        "images": [
          "577:554",
          0
        ]
      },
      "class_type": "RIFEInterpolation",
      "_meta": {
        "title": "RIFE Frame Interpolation"
      }
    },
    "596": {
      "inputs": {
        "frame_rate": [
          "607",
          0
        ],
        "loop_count": 0,
        "filename_prefix": "LTX",
        "format": "video/h264-mp4",
        "pix_fmt": "yuv420p",
        "crf": 32,
        "save_metadata": false,
        "trim_to_audio": false,
        "pingpong": false,
        "save_output": false,
        "images": [
          "583",
          0
        ],
        "audio": [
          "577:559",
          0
        ]
      },
      "class_type": "VHS_VideoCombine",
      "_meta": {
        "title": "Video Combine 🎥🅥🅗🅢"
      }
    },
    "602": {
      "inputs": {
        "url_or_path": imageUrl,
      },
      "class_type": "LoadImageFromUrlOrPath",
      "_meta": {
        "title": "LoadImageFromUrlOrPath"
      }
    },
    "607": {
      "inputs": {
        "a": fps || 30
      },
      "class_type": "CM_IntToFloat",
      "_meta": {
        "title": "Target FPS"
      }
    },
    "611": {
      "inputs": {
        "filename_prefix": randomId,
        "filenames": [
          "596",
          0
        ]
      },
      "class_type": "SaveVideoFilesS3",
      "_meta": {
        "title": "Save Video Files to S3"
      }
    },
    "613": {
      "inputs": {
        "root_dir": "output",
        "file": "file.txt",
        "append": "overwrite",
        "insert": true,
        "text": [
          "611",
          0
        ]
      },
      "class_type": "SaveText|pysssss",
      "_meta": {
        "title": "Save Text 🐍"
      }
    },
    "615": {
      "inputs": {
        "a": [
          "248",
          0
        ]
      },
      "class_type": "CM_IntToFloat",
      "_meta": {
        "title": "IntToFloat"
      }
    },
    "577:536": {
      "inputs": {
        "noise": [
          "577:567",
          0
        ],
        "guider": [
          "577:539",
          0
        ],
        "sampler": [
          "577:558",
          0
        ],
        "sigmas": [
          "577:537",
          0
        ],
        "latent_image": [
          "577:557",
          0
        ]
      },
      "class_type": "SamplerCustomAdvanced",
      "_meta": {
        "title": "ÉchantillonneurPersonnaliséAvancé"
      }
    },
    "577:537": {
      "inputs": {
        "sigmas": "0.909375, 0.725, 0.421875, 0.0"
      },
      "class_type": "ManualSigmas",
      "_meta": {
        "title": "Sigmas manuels"
      }
    },
    "577:538": {
      "inputs": {
        "positive": [
          "577:566",
          0
        ],
        "negative": [
          "577:566",
          1
        ],
        "latent": [
          "577:550",
          0
        ]
      },
      "class_type": "LTXVCropGuides",
      "_meta": {
        "title": "LTXVCropGuides"
      }
    },
    "577:540": {
      "inputs": {
        "width": [
          "577:563",
          0
        ],
        "height": [
          "577:563",
          1
        ],
        "batch_size": 1,
        "color": 0
      },
      "class_type": "EmptyImage",
      "_meta": {
        "title": "ImageVide"
      }
    },
    "577:541": {
      "inputs": {
        "video_latent": [
          "577:569",
          0
        ],
        "audio_latent": [
          "577:547",
          0
        ]
      },
      "class_type": "LTXVConcatAVLatent",
      "_meta": {
        "title": "Concaténation AV Latent LTXV"
      }
    },
    "577:542": {
      "inputs": {
        "samples": [
          "577:538",
          2
        ],
        "upscale_model": [
          "392",
          0
        ],
        "vae": [
          "405",
          0
        ]
      },
      "class_type": "LTXVLatentUpsampler",
      "_meta": {
        "title": "spatial"
      }
    },
    "577:543": {
      "inputs": {
        "upscale_method": "lanczos",
        "scale_by": 0.6,
        "image": [
          "577:540",
          0
        ]
      },
      "class_type": "ImageScaleBy",
      "_meta": {
        "title": "Agrandir l'image par"
      }
    },
    "577:544": {
      "inputs": {
        "img_compression": 12,
        "image": [
          "577:546",
          0
        ]
      },
      "class_type": "LTXVPreprocess",
      "_meta": {
        "title": "LTXVPreprocess"
      }
    },
    "577:545": {
      "inputs": {
        "width": [
          "577:564",
          0
        ],
        "height": [
          "577:564",
          1
        ],
        "length": [
          "577:565",
          0
        ],
        "batch_size": 1
      },
      "class_type": "EmptyLTXVLatentVideo",
      "_meta": {
        "title": "EmptyLTXVLatentVideo"
      }
    },
    "577:546": {
      "inputs": {
        "longer_edge": 1536,
        "images": [
          "577:570",
          0
        ]
      },
      "class_type": "ResizeImagesByLongerEdge",
      "_meta": {
        "title": "Redimensionner les images par le bord le plus long"
      }
    },
    "577:547": {
      "inputs": {
        "frames_number": [
          "577:565",
          0
        ],
        "frame_rate": [
          "248",
          0
        ],
        "batch_size": 1,
        "audio_vae": [
          "406",
          0
        ]
      },
      "class_type": "LTXVEmptyLatentAudio",
      "_meta": {
        "title": "Audio latent vide LTXV"
      }
    },
    "577:548": {
      "inputs": {
        "text": [
          "157",
          0
        ],
        "clip": [
          "407",
          0
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "577:549": {
      "inputs": {
        "noise_seed": 605516332438803
      },
      "class_type": "RandomNoise",
      "_meta": {
        "title": "RandomNoise Main"
      }
    },
    "577:550": {
      "inputs": {
        "av_latent": [
          "577:571",
          1
        ]
      },
      "class_type": "LTXVSeparateAVLatent",
      "_meta": {
        "title": "LTXVSeparateAVLatent"
      }
    },
    "577:555": {
      "inputs": {
        "sampler_name": "euler"
      },
      "class_type": "KSamplerSelect",
      "_meta": {
        "title": "KSamplerSelect Main"
      }
    },
    "577:556": {
      "inputs": {
        "strength": 1,
        "bypass": false,
        "vae": [
          "405",
          0
        ],
        "image": [
          "577:544",
          0
        ],
        "latent": [
          "577:542",
          0
        ]
      },
      "class_type": "LTXVImgToVideoInplace",
      "_meta": {
        "title": "LTXVImgToVideoInplace"
      }
    },
    "577:557": {
      "inputs": {
        "video_latent": [
          "577:556",
          0
        ],
        "audio_latent": [
          "577:550",
          1
        ]
      },
      "class_type": "LTXVConcatAVLatent",
      "_meta": {
        "title": "Concaténation AV Latent LTXV"
      }
    },
    "577:558": {
      "inputs": {
        "sampler_name": "euler"
      },
      "class_type": "KSamplerSelect",
      "_meta": {
        "title": "KSamplerSelect Upsc"
      }
    },
    "577:560": {
      "inputs": {
        "av_latent": [
          "577:536",
          1
        ]
      },
      "class_type": "LTXVSeparateAVLatent",
      "_meta": {
        "title": "LTXVSeparateAVLatent"
      }
    },
    "577:562": {
      "inputs": {
        "value": 3
      },
      "class_type": "PrimitiveInt",
      "_meta": {
        "title": "Int Tile Size VAE"
      }
    },
    "577:564": {
      "inputs": {
        "image": [
          "577:543",
          0
        ]
      },
      "class_type": "GetImageSize",
      "_meta": {
        "title": "Obtenir la taille de l'image"
      }
    },
    "577:565": {
      "inputs": {
        "value": [
          "577:603",
          0
        ]
      },
      "class_type": "PrimitiveInt",
      "_meta": {
        "title": "Length"
      }
    },
    "577:567": {
      "inputs": {
        "noise_seed": 42
      },
      "class_type": "RandomNoise",
      "_meta": {
        "title": "RandomNoise Upscaler"
      }
    },
    "577:569": {
      "inputs": {
        "strength": 0.7,
        "bypass": false,
        "vae": [
          "405",
          0
        ],
        "image": [
          "577:544",
          0
        ],
        "latent": [
          "577:545",
          0
        ]
      },
      "class_type": "LTXVImgToVideoInplace",
      "_meta": {
        "title": "LTXVImgToVideoInplace"
      }
    },
    "577:571": {
      "inputs": {
        "noise": [
          "577:549",
          0
        ],
        "guider": [
          "577:575",
          0
        ],
        "sampler": [
          "577:555",
          0
        ],
        "sigmas": [
          "577:572",
          0
        ],
        "latent_image": [
          "577:541",
          0
        ]
      },
      "class_type": "SamplerCustomAdvanced",
      "_meta": {
        "title": "ÉchantillonneurPersonnaliséAvancé"
      }
    },
    "577:575": {
      "inputs": {
        "any_02": [
          "520",
          0
        ]
      },
      "class_type": "Any Switch (rgthree)",
      "_meta": {
        "title": "Guider Switch"
      }
    },
    "577:572": {
      "inputs": {
        "any_02": [
          "519",
          0
        ]
      },
      "class_type": "Any Switch (rgthree)",
      "_meta": {
        "title": "Sigma Switch"
      }
    },
    "577:539": {
      "inputs": {
        "cfg": 1,
        "model": [
          "345",
          0
        ],
        "positive": [
          "577:538",
          0
        ],
        "negative": [
          "577:538",
          1
        ]
      },
      "class_type": "CFGGuider",
      "_meta": {
        "title": "GuideCFG"
      }
    },
    "577:574": {
      "inputs": {
        "value": 3
      },
      "class_type": "PrimitiveFloat",
      "_meta": {
        "title": "CFG"
      }
    },
    "577:573": {
      "inputs": {
        "value": 20
      },
      "class_type": "PrimitiveInt",
      "_meta": {
        "title": "Steps"
      }
    },
    "577:568": {
      "inputs": {
        "text": "blurry, out of focus, overexposed, underexposed, low contrast, washed out colors, excessive noise, grainy texture, poor lighting, flickering, motion blur, distorted proportions, unnatural skin tones, deformed facial features, asymmetrical face, missing facial features, extra limbs, disfigured hands, wrong hand count, artifacts around text, unreadable text, incorrect depth of field, background too sharp, background clutter, distracting reflections, harsh shadows, inconsistent lighting direction, color banding, unrealistic materials, uncanny valley effect, incorrect ethnicity, wrong gender, exaggerated expressions, wrong gaze direction, mismatched lip sync, silent or muted audio, distorted voice, robotic voice, echo, background noise, off-sync audio, missing sniff sounds, incorrect dialogue, added dialogue, repetitive speech, jittery movement, awkward pauses, incorrect timing, unnatural transitions, inconsistent framing, missing door or shelves, missing shallow depth of field, flat lighting, inconsistent tone, cinematic oversaturation, stylized filters, AI artifacts, watermark.",
        "clip": [
          "407",
          0
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "577:554": {
      "inputs": {
        "horizontal_tiles": [
          "577:562",
          0
        ],
        "vertical_tiles": [
          "577:562",
          0
        ],
        "overlap": 8,
        "last_frame_fix": false,
        "working_device": "auto",
        "working_dtype": "auto",
        "vae": [
          "405",
          0
        ],
        "latents": [
          "577:560",
          0
        ]
      },
      "class_type": "LTXVTiledVAEDecode",
      "_meta": {
        "title": "🅛🅣🅧 LTXV Tiled VAE Decode"
      }
    },
    "577:559": {
      "inputs": {
        "samples": [
          "577:560",
          1
        ],
        "audio_vae": [
          "406",
          0
        ]
      },
      "class_type": "LTXVAudioVAEDecode",
      "_meta": {
        "title": "Décodage Audio VAE LTXV"
      }
    },
    "577:566": {
      "inputs": {
        "frame_rate": [
          "577:605",
          1
        ],
        "positive": [
          "577:548",
          0
        ],
        "negative": [
          "577:568",
          0
        ]
      },
      "class_type": "LTXVConditioning",
      "_meta": {
        "title": "LTXVConditioning"
      }
    },
    "577:603": {
      "inputs": {
        "expression": "(round((a*b)/8)*8)+1",
        "a": [
          "248",
          0
        ],
        "b": [
          "247",
          0
        ]
      },
      "class_type": "MathExpression|pysssss",
      "_meta": {
        "title": "Power Puter (rgthree) total frames"
      }
    },
    "577:570": {
      "inputs": {
        "resize_type": "scale dimensions",
        "resize_type.width": 720,
        "resize_type.height": 1280,
        "resize_type.crop": "center",
        "scale_method": "lanczos",
        "input": [
          "584",
          0
        ]
      },
      "class_type": "ResizeImageMaskNode",
      "_meta": {
        "title": "Redimensionner image/masque"
      }
    },
    "577:563": {
      "inputs": {
        "image": [
          "577:570",
          0
        ]
      },
      "class_type": "GetImageSize",
      "_meta": {
        "title": "Obtenir la taille de l'image"
      }
    },
    "577:605": {
      "inputs": {
        "expression": "a",
        "a": [
          "248",
          0
        ]
      },
      "class_type": "MathExpression|pysssss",
      "_meta": {
        "title": "Power Puter (rgthree) FPS convert"
      }
    },
    "621": {
      "inputs": {
        "options": "Intermediate and Utility",
        "filenames": [
          "596",
          0
        ]
      },
      "class_type": "VHS_PruneOutputs",
      "_meta": {
        "title": "Prune Outputs 🎥🅥🅗🅢"
      }
    },
  }
}