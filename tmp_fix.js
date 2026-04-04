const fs = require('fs');

const files = [
  'app/api/users/profile/route.ts',
  'app/api/user/wishlist/route.ts',
  'app/api/user/notifications/route.ts',
  'app/api/chat/route.ts',
  'app/api/bookings/route.ts',
  'app/api/bookings/[id]/route.ts',
  'app/api/auth/master-login/route.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";',
    'const JWT_SECRET = process.env.JWT_SECRET;'
  );
  
  ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
    // A simple replacement just looking for the function signature
    const searchParam1 = `export async function ${method}(request: Request) {`;
    const replaceParam1 = searchParam1 + `\n  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});`;
    
    if (content.includes(searchParam1)) {
        content = content.replace(searchParam1, replaceParam1);
    }
    
    const searchParam2 = `export async function ${method}(request: Request, { params }: { params: any }) {`; 
    // We can also just use regex safely here inside a real JS file
    const rx = new RegExp(`export async function ${method}\\(req(?:uest)?: Request(?:, [^)]+)?\\) \\{`);
    if (rx.test(content) && !content.includes(`if (!JWT_SECRET)`)) {
       content = content.replace(rx, match => match + `\n  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});`);
    }
  });

  if (!content.includes('import { NextResponse')) {
    content = 'import { NextResponse } from "next/server";\n' + content;
  }
  fs.writeFileSync(file, content);
}
console.log('Successfully patched all JWT secrets.');
