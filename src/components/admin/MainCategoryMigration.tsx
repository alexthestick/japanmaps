import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import { Loader, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import type { MainCategory } from '../../types/store';

interface MigrationStats {
  total: number;
  updated: number;
  alreadyTagged: number;
  errors: number;
}

export function MainCategoryMigration() {
  const [isRunning, setIsRunning] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  /**
   * Detect CORRECT main category from store data
   * Returns the correct category, or null if already correct
   */
  const detectMainCategory = (store: any): MainCategory | null => {
    const categories = store.categories || [];
    const categoriesLower = categories.map((c: string) => c.toLowerCase());

    let correctCategory: MainCategory = 'Fashion'; // default

    // Check for coffee indicators
    if (categoriesLower.includes('coffee') ||
        store.name?.toLowerCase().includes('coffee') ||
        store.description?.toLowerCase().includes('coffee shop') ||
        store.description?.toLowerCase().includes('café')) {
      correctCategory = 'Coffee';
    }
    // Check for food indicators (case-insensitive, comprehensive list)
    else {
      const foodKeywords = [
        'ramen', 'sushi', 'izakaya', 'restaurant', 'food', 'bakery',
        'dessert', 'bar', 'dining', 'cafe', 'pizza', 'burger', 'curry',
        'yakitori', 'tempura', 'udon', 'soba', 'tonkatsu', 'yakiniku',
        'kaiseki', 'okonomiyaki', 'japanese', 'western', 'asian',
        'street food', 'fine dining'
      ];

      const hasFood = categoriesLower.some(cat =>
        foodKeywords.some(keyword => cat.includes(keyword))
      );

      if (hasFood) {
        correctCategory = 'Food';
      }
      // Check for fashion indicators (default assumption)
      else {
        const fashionKeywords = [
          'vintage', 'archive', 'secondhand', 'streetwear', 'designer',
          'luxury', 'fashion', 'clothing', 'store', 'shop', 'avant-garde',
          'military', 'antiques', 'stationery', 'flagship', 'concept'
        ];

        const hasFashion = categoriesLower.some(cat =>
          fashionKeywords.some(keyword => cat.includes(keyword))
        );

        if (hasFashion || categories.length > 0) {
          correctCategory = 'Fashion';
        }
      }
    }

    // If already has correct main_category, skip
    if (store.main_category === correctCategory) {
      return null;
    }

    // Return the correct category (will update even if main_category exists but is wrong)
    return correctCategory;
  };

  /**
   * Run the migration
   */
  const runMigration = async () => {
    setIsRunning(true);
    setStats({ total: 0, updated: 0, alreadyTagged: 0, errors: 0 });
    setLogs([]);

    try {
      addLog(`🚀 Starting migration (${isDryRun ? 'DRY RUN' : 'LIVE MODE'})...`);

      // Fetch all stores
      const { data: stores, error: fetchError } = await supabase
        .from('stores')
        .select('id, name, main_category, categories, description');

      if (fetchError) {
        throw new Error(`Failed to fetch stores: ${fetchError.message}`);
      }

      addLog(`📊 Found ${stores.length} total stores`);

      let updated = 0;
      let alreadyTagged = 0;
      let errors = 0;

      for (const store of stores) {
        try {
          // Detect correct main category (returns null if already correct)
          const mainCategory = detectMainCategory(store);

          if (!mainCategory) {
            // Already has correct category
            alreadyTagged++;
            addLog(`✓ ${store.name} - Already correctly tagged as ${store.main_category}`);
            continue;
          }

          // Log if fixing wrong category or adding new category
          if (store.main_category) {
            addLog(`🔧 ${store.name} - Fixing ${store.main_category} → ${mainCategory}`);
          } else {
            addLog(`🏷️ ${store.name} - Adding category → ${mainCategory}`);
          }

          // Update in database (if not dry run)
          if (!isDryRun) {
            const { error: updateError } = await supabase
              .from('stores')
              .update({ main_category: mainCategory })
              .eq('id', store.id);

            if (updateError) {
              throw updateError;
            }
          }

          updated++;
        } catch (error) {
          errors++;
          addLog(`❌ ${store.name} - Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
      }

      setStats({
        total: stores.length,
        updated,
        alreadyTagged,
        errors,
      });

      addLog('');
      addLog('✅ Migration complete!');
      addLog(`📊 Summary:`);
      addLog(`   Total stores: ${stores.length}`);
      addLog(`   Already tagged: ${alreadyTagged}`);
      addLog(`   ${isDryRun ? 'Would update' : 'Updated'}: ${updated}`);
      addLog(`   Errors: ${errors}`);

    } catch (error) {
      addLog(`❌ Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <Tag className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Main Category Migration</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">About this tool:</h3>
        <p className="text-sm text-blue-800">
          This tool will add a <code className="bg-blue-100 px-1 rounded">main_category</code> field
          (Fashion, Food, or Coffee) to all existing stores that don't have one. This enables proper
          filtering and search on the map.
        </p>
        <p className="text-sm text-blue-800 mt-2">
          <strong>Detection logic:</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-1 ml-4 space-y-1">
          <li>• Coffee: stores with "coffee" in name/categories or café descriptions</li>
          <li>• Food: stores with food-related categories (ramen, sushi, restaurant, etc.)</li>
          <li>• Fashion: everything else (default)</li>
        </ul>
      </div>

      {/* Dry Run Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDryRun}
            onChange={(e) => setIsDryRun(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            disabled={isRunning}
          />
          <span className="font-medium text-gray-900">
            Dry Run Mode
          </span>
          <span className="text-sm text-gray-600">
            (Preview changes without saving to database)
          </span>
        </label>
      </div>

      {/* Run Button */}
      <Button
        onClick={runMigration}
        disabled={isRunning}
        className="mb-6"
      >
        {isRunning ? (
          <>
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Running Migration...
          </>
        ) : (
          <>
            <Tag className="w-5 h-5 mr-2" />
            {isDryRun ? 'Preview Migration (Dry Run)' : 'Run Migration (LIVE)'}
          </>
        )}
      </Button>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Stores</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">{stats.updated}</div>
            <div className="text-sm text-green-600">
              {isDryRun ? 'Would Update' : 'Updated'}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{stats.alreadyTagged}</div>
            <div className="text-sm text-blue-600">Already Tagged</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-900">{stats.errors}</div>
            <div className="text-sm text-red-600">Errors</div>
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
