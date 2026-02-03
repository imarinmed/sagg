from .models import Episode, Scene, Character, Relationship, MythosElement

# In-memory storage
episodes_db: dict = {
    "ep1": Episode(
        id="ep1",
        title="Väntan",
        episode_number=1,
        season=1,
        air_date="2025-02-01",
        description="The beginning of a dark journey",
        synopsis="Introduction to the world of Blod svett tårar",
    ),
    "ep2": Episode(
        id="ep2",
        title="Möte",
        episode_number=2,
        season=1,
        air_date="2025-02-08",
        description="First encounter",
        synopsis="Characters meet under mysterious circumstances",
    ),
}

characters_db: dict = {
    "char1": Character(
        id="char1",
        name="Fiona",
        role="Protagonist",
        description="The main character",
        family="Lund",
        canonical_traits=["strong", "intelligent"],
        adaptation_traits=["darker", "complex"],
    ),
    "char2": Character(
        id="char2",
        name="Sebastian",
        role="Love Interest",
        description="Mysterious figure",
        family="Falk",
        canonical_traits=["mysterious", "powerful"],
        adaptation_traits=["dangerous", "charismatic"],
    ),
    "char3": Character(
        id="char3",
        name="Isabelle",
        role="Friend",
        description="Fiona's friend",
        canonical_traits=["loyal", "curious"],
        adaptation_traits=["perceptive"],
    ),
}

scenes_db: dict = {
    "scene1": Scene(
        id="scene1",
        episode_id="ep1",
        scene_number=1,
        title="Opening",
        description="The story begins",
        characters=["char1"],
    ),
    "scene2": Scene(
        id="scene2",
        episode_id="ep1",
        scene_number=2,
        title="Discovery",
        description="Something strange",
        characters=["char1", "char3"],
    ),
}

relationships_db: dict = {
    "rel1": Relationship(
        id="rel1",
        from_character_id="char1",
        to_character_id="char2",
        relationship_type="romance",
        description="Complex attraction and danger",
    ),
    "rel2": Relationship(
        id="rel2",
        from_character_id="char1",
        to_character_id="char3",
        relationship_type="friendship",
        description="Long-standing friendship",
    ),
}

mythos_db: dict = {
    "myth1": MythosElement(
        id="myth1",
        name="Vampirism",
        category="Supernatural",
        description="The curse of eternal life",
        related_characters=["char2"],
        significance="Core to the story",
    ),
    "myth2": MythosElement(
        id="myth2",
        name="The Bloodline",
        category="Family",
        description="Ancient family secrets",
        related_characters=["char2"],
        significance="Critical backstory",
    ),
}
