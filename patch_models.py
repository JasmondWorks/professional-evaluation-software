import os
import re

FILES = [
    ("app/(admin)/models/appraisal/page.tsx", 
     '<h1 className="text-2xl font-bold mb-6">', 
     """<div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">"""),
      
    ("app/(admin)/models/motivation/page.tsx",
     '<div className="border rounded">',
     """<div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>
      <div className="border rounded">"""),
      
    ("app/(admin)/models/non-academic-appraisal/page.tsx",
     '<div className="border rounded shadow-sm">',
     """<div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>
      <div className="border rounded shadow-sm">"""),
      
    ("app/(admin)/models/org-structure/page.tsx",
     '<h1 className="text-2xl font-bold mb-6">',
     """<div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">"""),
      
    ("app/(admin)/models/performance/page.tsx",
     '<div className="border rounded">',
     """<div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>
      <div className="border rounded">"""),
      
    ("app/(admin)/models/stress/page.tsx",
     '<div className="max-w-6xl mx-auto">',
     """<div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Link
            href="/models"
            className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
          >
            <ArrowLeft2 size="16" className="mr-1" /> Back to Models
          </Link>
        </div>""")
]

for filepath, target, replacement in FILES:
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        continue
        
    with open(filepath, "r") as f:
        content = f.read()

    # Inject imports if missing
    if "import { ArrowLeft2 } from" not in content:
        if 'import Link from "next/link";' in content:
            content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { ArrowLeft2 } from "iconsax-react";')
        elif 'import Link from \'next/link\';' in content:
            content = content.replace('import Link from \'next/link\';', 'import Link from \'next/link\';\nimport { ArrowLeft2 } from "iconsax-react";')
        else:
            # try finding the first import
            content = re.sub(r'^(import .*?;?\n)', r'\1import Link from "next/link";\nimport { ArrowLeft2 } from "iconsax-react";\n', content, count=1)
            
    # Inject back button
    if "Back to Models" not in content and target in content:
        content = content.replace(target, replacement, 1)
        
    with open(filepath, "w") as f:
        f.write(content)
        print(f"Patched {filepath}")

