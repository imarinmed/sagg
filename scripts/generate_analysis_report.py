#!/usr/bin/env python3
"""
Generate a comprehensive report from the enhanced video analysis.
"""

import json
from pathlib import Path
from collections import defaultdict


def generate_report(analysis_file: str, output_file: str):
    with open(analysis_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    report = []
    report.append("=" * 80)
    report.append("BLOD, SVETT, TÅRAR - VIDEO ANALYSIS ENHANCEMENT REPORT")
    report.append("=" * 80)
    report.append("")
    
    # Overall statistics
    total_episodes = data.get("total_episodes", 0)
    report.append(f"Total Episodes Analyzed: {total_episodes}")
    report.append("")
    
    # Aggregate statistics across all episodes
    all_content_types = defaultdict(int)
    all_locations = set()
    all_characters = set()
    total_moments = 0
    total_suggestive = 0
    
    for episode in data.get("episodes", []):
        total_moments += len(episode.get("key_moments", []))
        total_suggestive += len(episode.get("suggestive_scenes", []))
        
        for ctype, count in episode.get("content_type_distribution", {}).items():
            all_content_types[ctype] += count
        
        all_locations.update(episode.get("locations_detected", []))
        all_characters.update(episode.get("character_appearances", {}).keys())
    
    report.append("-" * 80)
    report.append("OVERALL STATISTICS")
    report.append("-" * 80)
    report.append(f"Total Moments Analyzed: {total_moments}")
    report.append(f"Suggestive/High-Intensity Scenes: {total_suggestive}")
    report.append(f"Unique Characters Detected: {len(all_characters)}")
    report.append(f"Locations Identified: {len(all_locations)}")
    report.append("")
    
    # Content type distribution
    report.append("-" * 80)
    report.append("CONTENT TYPE DISTRIBUTION (All Episodes)")
    report.append("-" * 80)
    for ctype, count in sorted(all_content_types.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_moments) * 100
        report.append(f"  {ctype:30s}: {count:4d} ({percentage:5.1f}%)")
    report.append("")
    
    # Locations
    report.append("-" * 80)
    report.append("LOCATIONS DETECTED")
    report.append("-" * 80)
    for location in sorted(all_locations):
        report.append(f"  - {location}")
    report.append("")
    
    # Characters
    report.append("-" * 80)
    report.append("CHARACTERS DETECTED")
    report.append("-" * 80)
    for char in sorted(all_characters):
        report.append(f"  - {char}")
    report.append("")
    
    # Per-episode breakdown
    report.append("-" * 80)
    report.append("PER-EPISODE BREAKDOWN")
    report.append("-" * 80)
    report.append("")
    
    for episode in data.get("episodes", []):
        ep_id = episode.get("episode_id", "unknown").upper()
        report.append(f"\n{ep_id}")
        report.append("-" * 40)
        report.append(f"  Title: {episode.get('title', 'N/A')}")
        report.append(f"  Duration: {episode.get('duration', 'N/A')}")
        report.append(f"  Total Moments: {len(episode.get('key_moments', []))}")
        report.append(f"  Suggestive Scenes: {len(episode.get('suggestive_scenes', []))}")
        report.append(f"  Characters: {len(episode.get('character_appearances', {}))}")
        report.append(f"  Locations: {', '.join(episode.get('locations_detected', [])) or 'None'}")
        
        # Top content types for this episode
        content_dist = episode.get("content_type_distribution", {})
        if content_dist:
            report.append("  Top Content Types:")
            for ctype, count in sorted(content_dist.items(), key=lambda x: x[1], reverse=True)[:5]:
                report.append(f"    - {ctype}: {count}")
        
        # Character interactions
        interactions = episode.get("character_interactions", [])
        if interactions:
            report.append("  Top Character Interactions:")
            for interaction in interactions[:5]:
                report.append(f"    - {interaction['pair']}: {interaction['count']} scenes")
    
    report.append("")
    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)
    
    # Write report
    report_text = "\n".join(report)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(report_text)
    
    # Also print to console
    print(report_text)
    print(f"\nReport saved to: {output_file}")


if __name__ == "__main__":
    analysis_file = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/video_analysis_enhanced.json"
    output_file = "/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/ANALYSIS_REPORT.txt"
    
    generate_report(analysis_file, output_file)
