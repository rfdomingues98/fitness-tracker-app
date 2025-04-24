# Fitness Tracker App - Implementation Plan

## Project Overview
A local-first fitness tracking app that uses real-time geolocation to track running routes with:
- Session management (start/stop)
- Real-time map display 
- Live metrics (speed, duration, pace)
- Future dashboard with history and analytics
- Optional synchronization with a backend service (e.g., Supabase) for data backup and multi-device access.

## Tech Stack
- Expo/React Native
- Mapbox for mapping
- NativeWind for styling
- AsyncStorage for local storage
- Supabase (or similar BaaS) for backend synchronization (using Postgres DB)
- Legend State for state management and synchronization

## Phase 1: Setup & Core Functionality

### 1. Project Setup
- [x] Initialize Expo project
- [x] Install required dependencies:
  - [x] `expo-location` for geolocation tracking
  - [x] `@rnmapbox/maps` for Mapbox integration
  - [x] `nativewind` and configure Tailwind CSS
  - [x] `@react-native-async-storage/async-storage` for local data storage
  - [x] `expo-sensors` for additional motion data
  - [x] `@legendapp/state` for state management

### 2. Core Features Implementation
- [x] Location Tracking Service
  - [x] Create location provider (`LocationProvider.tsx`)
  - [x] Implement foreground and background permission handling
  - [ ] Calculate speed, distance, and pace (Requires workout session context)
  - [x] Track GPS coordinates for route drawing (Implemented via `locationHistory`)

- [x] Workout Session Management
  - [x] Create session provider (`WorkoutSessionProvider.tsx`)
  - [x] Implement start/stop functionality interacting with `LocationProvider`
  - [ ] Background tracking capability (Needs further implementation, possibly with `expo-task-manager`)

- [ ] Map Integration
  - [ ] Set up Mapbox component
  - [ ] Display real-time user location
  - [ ] Draw route path as user moves
  - [ ] Add map controls (zoom, center on user)

- [ ] Real-time Metrics Display
  - [ ] Create metrics component
  - [ ] Show current speed, pace, duration, distance
  - [ ] Add calorie estimation algorithm

- [ ] Local Data Persistence & Backend Sync
  - [ ] Local Storage (AsyncStorage):
    - [x] Define data structure for local storage (e.g., keys for workouts, user data)
    - [x] Create utility functions/service for interacting with AsyncStorage
    - [x] Implement local session saving using AsyncStorage
  - [ ] Backend Synchronization (using Legend State & Supabase Postgres):
    - [ ] Set up Supabase project and Postgres database
    - [ ] Define backend Postgres schema (mirroring/extending local structure)
    - [ ] Configure Legend State persistence adapters for AsyncStorage and Supabase.
    - [ ] Implement sync logic using Legend State observables and persistence features.
    - [ ] Handle potential sync conflicts (e.g., leveraging Legend State's conflict resolution mechanisms or implementing custom logic).
    - [ ] Implement authentication for backend sync (using Supabase Auth)

## Phase 2: UI Implementation

### 3. Screen Development
- [ ] Main Tracking Screen
  - [ ] Map view
  - [ ] Start/stop controls
  - [ ] Real-time metrics panel
  - [ ] Session status indicator

- [ ] Session History Screen
  - [ ] List of past sessions
  - [ ] Basic filtering and sorting options
  - [ ] Session detail view with map replay

- [ ] Settings Screen
  - [ ] User preferences
  - [ ] Units selection (km/mi)
  - [ ] Map style options

### 4. UI Components
- [ ] Action Buttons
  - [ ] Start button
  - [ ] Stop/pause button
  - [ ] Resume button

- [ ] Metrics Panel
  - [ ] Speed/pace display
  - [ ] Time/distance counters
  - [ ] Elevation data (if available)

- [ ] Session Cards
  - [ ] Summary information
  - [ ] Miniature route preview
  - [ ] Date and duration

## Phase 3: Enhanced Features

### 5. Analytics & Dashboard
- [ ] Create dashboard screen
  - [ ] Weekly/monthly activity summary
  - [ ] Performance trends
  - [ ] Achievement tracking

- [ ] Advanced Metrics
  - [ ] Pace analysis
  - [ ] Split times
  - [ ] Elevation profiles

### 6. Additional Features
- [ ] Audio feedback during workouts
- [ ] Social sharing capabilities
- [ ] Workout type selection (run, walk, cycling)
- [ ] Weather integration

## Implementation Notes

- Ensure proper handling of background location tracking
- Implement battery optimization strategies
- Address potential GPS accuracy issues
- Consider offline functionality for areas with poor connectivity
- Develop a robust synchronization strategy, handling conflicts and ensuring data integrity.
- Ensure the core app functionality remains fully operational offline.
