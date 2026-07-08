import sys
path = 'app/(admin)/em-database/[user]/page.tsx'
with open(path, 'r') as f:
    c = f.read()

target = """    async function deleteUser() {
        if (!confirm(`Are you sure you want to delete ${user.email} from ${user.org}?`)) {
            return; // user cancelled
        }

        try {
            const res = await fetch("/api/users/delete", {"""

replacement = """    async function deleteUser() {
        if (!confirm(`Are you sure you want to delete ${user.email} from ${user.org}?`)) {
            return; // user cancelled
        }

        try {
            const access_token = getAccessToken() as string;
            const res = await fetch("/api/users/delete", {"""

if target in c:
    c = c.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(c)
    print("Replaced successfully")
else:
    print("Target not found")
