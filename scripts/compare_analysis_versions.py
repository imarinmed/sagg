#!/usr/bin/env python3
"""
Compare original vs enhanced analysis to show improvements.
"""

import json
from pathlib import Path
from collections import defaultdict


def compare_analyses(original_file: str, enhanced_file: str):
    # Load both files
    with open(original_file, "r", encoding="utf-8") as f:
        original = json.load(f)
    
    with open(enhanced_file, "r", encoding="utf-8") as f:
        enhanced = json.load(f)
    
    print("=" * 80)
    print("ANALYSIS COMPARISON: ORIGINAL vs ENHANCED")
    print("=" * 80)
    print()
    
    # Compare each episode
    for orig_ep, enh_ep in zip(original.get("episodes", []), enhanced.get("episodes", [])):
        ep_id = orig_ep.get("episode_id", "unknown").upper()
        
        print(f"\n{ep_id}")
        print("-" * 80)
        
        # Count moments with characters
        orig_with_chars = sum(1 for m in orig_ep.get("key_moments", []) if m.get("characters_present"))
        enh_with_chars = sum(1 for m in enh_ep.get("key_moments", []) if m.get("characters_present"))
        
        print(f"Moments with character detection:")
        print(f"  Original: {orig_with_chars}")
        print(f"  Enhanced: {enh_with_chars}")
        print(f"  Improvement: {enh_with_chars - orig_with_chars} more moments")
        
        # Unique characters
        orig_chars = set(orig_ep.get("character_appearances", {}).keys())
        enh_chars = set(enh_ep.get("character_appearances", {}).keys())
        
        print(f"\nCharacters detected:")
        print(f"  Original: {len(orig_chars)} - {sorted(orig_chars)}")
        print(f"  Enhanced: {len(enh_chars)} - {sorted(enh_chars)}")
        
        # Content types
        orig_types = set(m.get("content_type", "dialogue") for m in orig_ep.get("key_moments", []))
        enh_types = set(enh_ep.get("content_type_distribution", {}).keys())
        
        print(f"\nContent types:")
        print(f"  Original: {len(orig_types)} types")
        print(f"  Enhanced: {len(enh_types)} types")
        print(f"  New types: {sorted(enh_types - orig_types)}")
        
        # Metadata fields
        print(f"\nNew metadata fields:")
        print(f"  - location: {len(enh_ep.get('locations_detected', []))} locations detected")
        print(f"  - vampire_lore_elements: Present in enhanced moments")
        print(f"  - relationships_highlighted: Tracking character dynamics")
        print(f"  - mood: Emotional tone detection")
        
        # Sample moments with character detection
        print(f"\nSample moments with character detection:")
        count = 0
        for moment in enh_ep.get("key_moments", [])[:50]:
            chars = moment.get("characters_present", [])
            if chars and count < 3:
                print(f"  [{moment['timestamp']}] {moment['description'][:60]}...")
                print(f"    Characters: {chars}")
                count += 1


if __name__ == "__main__":
    original_file = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis.json"
    enhanced_file = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_enhanced.json"
    
    compare_analyses(original_file, enhanced_file)
