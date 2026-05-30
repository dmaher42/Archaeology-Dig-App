import re

def update_file():
    with open("src/data.js", "r", encoding="utf-8") as f:
        content = f.read()

    # The createBureauCase update
    content = content.replace(
        "    keywords: flattenBureauProfileFacts(caseItem.keywords || flatProfileFacts),\n  };\n};",
        "    profileSummary: caseItem.profileSummary || '',\n  };\n};"
    )

    replacements = [
        (
            "keywords: ['Nile Flood', 'Pharaohs', 'Pyramids']",
            "profileSummary: 'This civilisation developed along a desert river, relying on annual floods for farming. It was ruled by powerful monarchs seen as living gods, and is famous for constructing monumental tombs to protect them.'"
        ),
        (
            "keywords: ['City-States', 'Democracy', 'Sparta']",
            "profileSummary: 'Emerging on a mountainous peninsula with natural harbours, this civilisation was divided into independent city-states. Some experimented with early forms of democracy, while others focused heavily on military training.'"
        ),
        (
            "keywords: ['Senate', 'Laws', 'Empire']",
            "profileSummary: 'Starting as a single city, this society built a massive empire through highly organised military legions. They are renowned for their advanced engineering, particularly the stone structures built to supply their cities with water.'"
        ),
        (
            "keywords: ['Dynasties', 'Paper', 'Walls']",
            "profileSummary: 'Ruled by successive powerful families, this society developed along major rivers and built extensive trade networks stretching westward. They also undertook massive defensive construction projects to protect their northern borders.'"
        ),
        (
            "keywords: ['Calendars', 'Stars', 'Pyramids']",
            "profileSummary: 'Thriving in dense rainforest environments, this civilisation developed advanced understanding of astronomy and timekeeping. Their cities featured towering stone temples with terraced steps rising above the jungle canopy.'"
        ),
        (
            "keywords: ['Quipu', 'Andes', 'Machu Picchu']",
            "profileSummary: 'Perched high in rugged mountain ranges, this empire connected its vast territory with an incredible network of paved trails. They built impressive stone estates and terraces on steep peaks without the use of wheeled transport.'"
        ),
        (
            "keywords: ['Drainage', 'Untranslated Writing', 'Seals']",
            "profileSummary: 'Located on a fertile floodplain, this early society is famous for its highly planned, grid-like cities with advanced plumbing. They used intricately carved small stone markers, though their writing remains undeciphered.'"
        ),
        (
            "keywords: ['Two Rivers', 'Laws', 'Ziggurat']",
            "profileSummary: 'Thriving between two major rivers, this society pioneered early urban life, organized law codes, and built massive tiered temples known as ziggurats that dominated their city landscapes.'"
        ),
        (
            "keywords: ['Governors', 'Religions', 'Empire']",
            "profileSummary: 'This sprawling empire spanned three continents and was famous for its tolerance of different cultures. It was efficiently managed by regional governors and connected by a massive, well-maintained royal highway.'"
        ),
        (
            "keywords: ['Constantinople', 'Justinian', 'Eastern Roman Empire']",
            "profileSummary: 'Surviving the fall of its western counterpart, this empire thrived for another thousand years at the crossroads of Europe and Asia. It was characterized by its unique Christian traditions and a highly fortified, wealthy capital city.'"
        ),
        (
            "keywords: ['Sultans', 'Istanbul', 'Crossroads']",
            "profileSummary: 'Rising from a peninsula between the Black and Mediterranean seas, this powerful empire bridged east and west. Ruled by absolute monarchs, their military was renowned for its early and devastating use of gunpowder artillery.'"
        ),
        (
            "keywords: ['Tenochtitlan', 'Sun', 'Emperor']",
            "profileSummary: 'Building their magnificent capital city on an island in a central lake, this warrior society dominated its neighbours, demanding wealth and resources in return. Their religion required intense, sometimes violent offerings to sustain the sun and the gods.'"
        )
    ]

    for k, p in replacements:
        content = content.replace(f"    {k},", f"    {p},")

    with open("src/data.js", "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    update_file()
