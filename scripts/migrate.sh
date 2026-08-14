#!/bin/bash

# Database Migration Script
# Runs pending database migrations

set -e

echo "🗄️  I CALL ON Database Migration"
echo "==================================="

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  exit 1
fi

echo "🔄 Running migrations..."

# Run schema initialization
echo "📝 Applying schema..."
psql $DATABASE_URL -f database/schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Schema applied successfully"
else
  echo "❌ Schema application failed"
  exit 1
fi

# Seed default achievements
echo "📝 Seeding default achievements..."
psql $DATABASE_URL << EOF
INSERT INTO achievements (achievement_id, name, description, icon, requirement, type, reward_xlm) VALUES
  ('first_win', 'First Victory', 'Win your first game', '🏆', 1, 'wins', 1),
  ('ten_wins', 'On a Roll', 'Achieve 10 wins', '🔥', 10, 'wins', 5),
  ('hundred_wins', 'Champion', 'Achieve 100 wins', '👑', 100, 'wins', 50),
  ('hundred_xlm_earned', 'Crypto Millionaire', 'Earn 100 XLM', '💰', 100, 'earnings', 10)
ON CONFLICT (achievement_id) DO NOTHING;
EOF

if [ $? -eq 0 ]; then
  echo "✅ Default achievements seeded"
else
  echo "❌ Failed to seed achievements"
  exit 1
fi

echo ""
echo "✅ Migration completed successfully!"
echo ""
