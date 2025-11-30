const GOOGLE_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1xxhXwW09jAlbbUhGfnoEQu_vT_bcTHi9WfPlpqXPmNM/export?format=csv&gid=0";

export interface RemoteConfig {
  minVersion: string;
  newsMessage: string;
  optionalLink: string;
}

/**
 * Parse a CSV row respecting quoted fields
 * Handles commas inside quoted fields
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Fetches remote configuration from Google Sheets CSV export
 * Expected format:
 * Row 1: Min version | <version>
 * Row 2: What's new  | <news message>
 * Row 3: Optional link | <url>
 */
export async function fetchRemoteConfig(): Promise<RemoteConfig | null> {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, {
      method: "GET",
      headers: {
        Accept: "text/csv",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch remote config: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const csvText = await response.text();

    // Parse CSV - expecting format:
    // "Min version","1.0.0"
    // "What's new","Sample text with commas, and more text"
    // "Optional link","https://example.com"
    const lines = csvText.trim().split("\n");

    if (lines.length < 2) {
      console.error("Invalid CSV format: not enough rows");
      return null;
    }

    // Parse first row (min version)
    const versionRow = parseCSVRow(lines[0]);
    const minVersion = versionRow[1]?.trim() || "1.0.0";

    // Parse second row (news message)
    const newsRow = parseCSVRow(lines[1]);
    const newsMessage = newsRow[1]?.trim() || "";

    // Parse third row (optional link)
    const linkRow = lines[2] ? parseCSVRow(lines[2]) : [];
    const optionalLink = linkRow[1]?.trim() || "";

    return {
      minVersion,
      newsMessage,
      optionalLink,
    };
  } catch (error) {
    console.error("Error fetching remote config:", error);
    return null;
  }
}
