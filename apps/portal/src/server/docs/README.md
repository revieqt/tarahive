A. Folder Structure
server/
-docs/
--docs.routes.ts
--docs.controller.ts
--docs.service.ts
--files/ (this contains all of the grouped json files to be passed to frontend)
---[file name]/ (file name, example 'manual')
----v1.0/
-----index.json (this is the main json file)
-----[group id]/ (grouped jsons, example 'getting-started.json' or 'itinerary.json')
------[section id].json (section page json, example 'installation.json')

B. index.json example content:
{
  "id": "manual",
  "name": "App Manual",
  "version": "1.0",
  "created_on": "2026-07-01",
  "groups": [
    {
        "id": "getting-started",
        "name": "Getting Started",
        "sections":[
            { "id": "installation", "title": "Installation" },
            { "id": "first-steps", "title": "First Steps" }
        ]
    },
    {
        "id": "itinerary",
        "name": "Itinerary Management",
        "sections":[
            { "id": "creating-itinerary", "title": "Creating an Itinerary" },
            { "id": "editing-itinerary", "title": "Editing an Itinerary" }
        ]
    }
  ]
}

C. [section id].json example content:
{
    "id": "installation",
    "title": "Installation",
    "subtitle": "How to install the application.",
    "blocks": [
        {
            "type": "heading",
            "text": "Through the Web Portal"
        },
        {
            "type": "paragraph",
            "text": "To install the application, Follow these steps:"
        },
        {
            "type": "list",
            "items": [
                "Open the web portal in your browser (https://tarahive.vercel.app)",
                "Click on the 'Download' button, It will redirect you to the download page.",
                "Choose the appropriate version for your operating system (Windows, macOS, or Linux) and click on the download link."
            ]
        },
        {
            "type": "image",
            "src": "/docs/manual/v1.0/images/installation.png",
            "caption": "Download page"
        },
        {
            "type": "note",
            "text": "Note: Ensure that you have a stable internet connection during the download process."
        },
        {
            "type": "divider"
        }
    ]
}