#!/bin/bash

# Build the React app
npm run build

# Transfer files to VPS
scp -r build/* root@162.243.169.74:/var/www/demarketcap.xyz/

# SSH into the VPS and set permissions, reload Nginx
ssh root@162.243.169.74 << EOF
  chown -R www-data:www-data /var/www/demarketcap.xyz
  chmod -R 755 /var/www/demarketcap.xyz
  systemctl reload nginx
EOF

echo "Deployment completed!"
