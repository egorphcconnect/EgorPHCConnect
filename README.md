# Egor PHC Connect

Build a production-ready web application called "Egor PHC Connect" for residents of Egor Local Government Area, Edo State, Nigeria.

PROJECT PURPOSE

Egor PHC Connect is a mobile-first healthcare directory and public health information platform designed to improve access to Primary Healthcare Centres (PHCs) within Egor LGA.

The platform should help residents:

Locate PHCs

View available services

Access contact information

Obtain directions to facilities

Read public health information

Submit anonymous service feedback

Help local health administrators understand service utilization and satisfaction

TARGET USERS

Community residents

Pregnant women and caregivers

Elderly users

People with low digital literacy

Local government health administrators

DESIGN REQUIREMENTS

Mobile-first

Responsive

WCAG-accessible

Government healthcare aesthetic

Modern and trustworthy

Clean public-health visual design

Optimized for low-bandwidth environments

Large touch targets

Simple navigation

Clear typography using Inter

COLOR SYSTEM

Primary:

Healthcare Blue (#2563EB)

Secondary:

Public Health Green (#10B981)

Background:

White and light neutral backgrounds

ARCHITECTURE REQUIREMENTS

Use:

Next.js 15

TypeScript

Tailwind CSS

Supabase

Google Maps integration

The application must use reusable components and shared data models.

DATA MODELS

PHC

id

name

address

ward

services

operatingHours

contactPhone

latitude

longitude

images

status

lastUpdated

Feedback

id

phcId

serviceUsed

rating

staffProfessionalism

waitingTime

cleanliness

comments

anonymous

createdAt

Health Article

id

category

title

summary

content

tags

APPLICATION PAGES

Home Page

Include:

Hero section

Search bar

Quick service categories

Nearby PHCs section

Public health announcements

Footer

Quick service categories:

Antenatal Care

Immunization

Family Planning

Child Welfare

Malaria Treatment

HIV Services

PHC Directory

Features:

Search

Filter by service

Filter by ward

Open now filter

Sort by name

Sort by distance

PHC cards should display:

PHC name

Ward

Services

Operating hours

Distance

Include:

Loading state

Empty state

No results state

PHC Details Page

Display:

PHC name

Address

Contact number

Services

Operating hours

Status

Include:

Open in Google Maps

Get Directions

Call PHC

Leave Feedback

Include clinic schedule section.

Gracefully handle missing data.

Google Maps Integration

Include:

Facility map

Marker

Directions functionality

If coordinates are missing, use address-based fallback links.

Anonymous Feedback Page

Fields:

PHC visited

Service used

Rating

Staff professionalism

Waiting time

Facility cleanliness

Comments

Include:

Anonymous checkbox

Submit button

Success screen

Design so completion takes less than one minute.

Health Information Section

Categories:

Maternal Health

Child Health

Immunization

Malaria

Tuberculosis

HIV/AIDS

Nutrition

Hygiene and Sanitation

Article cards should include:

Title

Summary

Read More

Admin Dashboard

Metrics:

Total PHCs

Total feedback submissions

Average ratings

Most requested services

Include:

Feedback trends

Satisfaction metrics

Service utilization charts

Include export functionality.

NAVIGATION

Create a consistent navigation system linking:

Home

PHC Directory

Health Information

Feedback

About

TECHNICAL REQUIREMENTS

Use reusable components

Shared layouts

Shared data models

Clean folder structure

Scalable architecture

Supabase-ready database integration

Mobile-first responsiveness

Accessibility compliance

DATA REQUIREMENTS

Do not hardcode production data.

Create realistic placeholder data and seed examples that can later be replaced with actual PHC field-visit information collected from Egor LGA.

OUTPUT

Generate:

Application architecture

Folder structure

Database schema

Core reusable components

Representative page implementations

Supabase integration setup

Navigation structure

Prioritize maintainability, scalability, and ease of future updates by a novice developer.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://egorphcconnect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a265bf3d-c37b-47a3-87f0-c1e0616caadb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
