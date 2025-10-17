# Collaborative Lists Feature

## Overview
The Collaborative Lists feature allows multiple users in a session to work together on creating and verifying lists. One person creates a list (bullet or numbered), and others can verify each item as accurate (green) or inaccurate (red) with optional correction text.

## How It Works

### For List Creators
1. Navigate to the "Collaborative Lists" tab
2. Enter a list title (e.g., "Project Steps", "Event Timeline")
3. Choose between Bullet or Numbered list
4. Click "Create List"
5. Add items to your list using the input field at the bottom
6. Edit or delete items as needed

### For Verifiers (Other Team Members)
1. Navigate to the "Collaborative Lists" tab
2. View lists created by others in the session
3. For each item, choose:
   - **Green (Accurate)**: Item is correct
   - **Red (Inaccurate)**: Item needs correction
4. If marking red, provide a suggested correction
5. See what others think via the consensus meter

## Key Features

### Consensus Meter (Gamification Twist!)
Each list item shows a visual consensus meter:
- **Green bar (80%+)**: Strong agreement item is accurate
- **Yellow bar (50-79%)**: Mixed opinions
- **Red bar (<50%)**: Majority thinks item needs correction
- Shows count of accurate vs inaccurate votes
- Displays percentage of consensus

### Real-Time Collaboration
- All changes sync instantly across all users
- See verifications appear in real-time
- Watch consensus meter update live
- No page refresh needed

### Color-Coded Feedback
- Items you marked accurate have a **green** left border
- Items you marked inaccurate have a **red** left border
- Unmarked items have a **gray** left border

### Correction Suggestions
When marking an item as inaccurate:
1. A text field appears
2. Enter your suggested correction
3. Your correction is visible to all team members
4. Helps the creator understand what needs fixing

## Use Cases
- **Project Planning**: Verify task sequences and steps
- **Event Timelines**: Confirm order and timing of events
- **Process Documentation**: Validate procedure steps
- **Meeting Notes**: Verify action items and decisions
- **Brainstorming**: Refine and validate ideas collectively

## Database Schema

### Tables Created
1. **collaborative_lists**: Stores list metadata
   - id, session_id, title, list_type, creator_id, creator_name, timestamps

2. **list_items**: Stores individual list items
   - id, list_id, text, order_index, timestamps

3. **list_item_verifications**: Stores user votes
   - id, item_id, user_id, user_name, is_accurate, correction_text, timestamps
   - Unique constraint: one vote per user per item

### Realtime Support
All three tables have Supabase realtime enabled for instant updates.

## Technical Implementation

### Hooks
- `useCollaborativeLists`: Manage lists in a session
- `useListItems`: Manage items within a list
- `useListItemVerifications`: Handle voting and corrections

### Components
- `ListCreatorForm`: Form to create new lists
- `CollaborativeListComponent`: Displays a single list with all items
- `ListItemComponent`: Individual item with verification controls

### Navigation
Accessible via tabs at the top of the main page:
- "Tasks" tab: Original task management
- "Collaborative Lists" tab: New list verification feature

## Tips for Best Experience
1. **Clear Titles**: Use descriptive list titles so everyone knows the context
2. **Specific Items**: Write clear, specific list items
3. **Helpful Corrections**: When marking red, explain what's wrong
4. **Regular Check-ins**: Review consensus meters to see where team agrees/disagrees
5. **Expand/Collapse**: Click the arrow to collapse lists you're not working on

## Future Enhancements (Ideas)
- Export lists to markdown/PDF
- Comments/discussion threads per item
- History/audit trail of changes
- Templates for common list types
- Priority/importance ratings
- Due dates for time-sensitive items
