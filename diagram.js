// Function to fetch data from the JSON API endpoint
async function fetchCapModel() 
{
	const url = 'http://localhost:800/cloud.json';
	try {
		// URL should tag on Capmodel
		const resp = await fetch(url, {
			headers: { 'Content-Type': 'application/json', }
		});

		if (!resp.ok) {
			throw new Error('HTTP error! status: ${resp.status}');
		}

		const data = await resp.json();
		const CapModel = data.record;
	} catch (error) {
		console.error("Failed to load data:",error);
	}
}

// Load the first level sections and recurse
function LoadSections() {

	// Stage some colornames from the map
	var cnames=[];
	let idx=0;
	for (var key in colorMap) {
		cnames[idx]=key;	
		idx++;
	}

	// Append all sections dynamically to the container
	const sContainer = document.getElementById('sections-container');
	if (typeof CapModel !== 'undefined') {
		let idx = 0;
		CapModel.forEach(sData => 
		{
			if (Mode === 0) {
				color=cnames[idx];
				if (idx++ >= cnames.length-1) {
					idx=0;
				}
			} else {
				//color=sData.Maturity
				color="white";
			}
			const section = createSection(sData,1,color);
			sContainer.appendChild(section);
		});
	}
}

function applyFullWidthClass() 
{
	const containerWidth = document.querySelector('.container').offsetWidth;
	const sections = document.querySelectorAll('.section');

	sections.forEach((section,index) => {
		section.classList.remove('full-width'); 

		const sectionWidth = section.offsetWidth;
		const sectionRightEdge = section.getBoundingClientRect().right;
		const containerRightEdge = containerWidth;

		// Apply .full-width if last section in row and space to expand
		if (section.RightEdge < containerRightEdge && index === sections.length - 1) {
			section.classList.add('full-width');
		}
	});
}

// Function to create and append section HTML elements dynamically
function createSection(sData,lvl,color) 
{
	console.log("createSection(\""+sData.Title+"\","+lvl+","+color+")");
	if (lvl === 1) {
		sName="section";
		sTitle="section-title";
	} else {
		sName="sub-section";
		sTitle="sub-section-title";
	}
	const section = document.createElement('div');

	section.classList.add(sName,color);
	section.innerHTML = `<div class=sTitle>${sData.Title}</div>`;

	section.addEventListener('click', (event) => {
		if (lvl !== 1) { event.stopPropagation(); }
		openModal(sData.Title,sData.Description);
	});

	if (sData.subSections && lvl < Depth) {
		const subContainer = document.createElement('div');

		sData.subSections.forEach(subSData => {
			if (Mode !== 0) {
				// Could use lvl Multiplier on color !!
				color = subSData.Maturity;
			}

			const subSection = createSection(subSData,lvl+1,color);
			subContainer.appendChild(subSection);
		});
		section.appendChild(subContainer);
	}
	return section;
}

// Function to open the modal with the title, descriptions and optionally L4's
function openModal(title, description, subSections = null, parentColor = null) 
{
	const modalTitle = document.getElementById('modal-title');
	const modalDescription = document.getElementById('modal-description');
	const modal = document.getElementById('modal');
console.log("openModal()");
		
	modalTitle.textContent = title;
	modalDescription.textContent = description;

	// Clear any existing L4 boxes
	const existingL4Container = document.querySelector('.l4-container');
	if (existingL4Container) { existingL4Container.remove(); }

	// If L4 subSections exist, create a container for them and append boxes
	if (subSections) {
		const l4Container = document.createElement('div');
		l4Container.classList.add('l4-container');
		l4Container.style.display = 'flex';
		l4Container.style.justifyContent = 'center';
		l4Container.style.gap = '10px';
		l4Container.style.marginTop = '20px';
	
		const hexParentColor = colorNameToHex(parentColor);

		subSections.forEach(l4Data => {
			const l4Box = document.createElement('div');

			l4Box.classList.add('box');
			l4Box.textContent = l4Data.Title;
	
			// Assign a darker shade of the parent L3 color to L4 box
			l4box.style.backgroundColor = darkenColor(hexParentColor, 0.5);

			l4Box.addEventListner('click',(event) => {
				event.stopPropogation();
				openModal(l4Data.Title, l4Data.Description, null, l4Box.style.backgroundColor);
			});

			l4Container.appendChild(l4Box);
		});
		modalDescription.appendChild(l4Container);
	}
	modal.style.display = 'flex';
}

// Close modal when clicking on the X
document.getElementById('modal-close-x').addEventListener('click', () => 
{
	document.getElementById('modal').style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click',(event) => 
{
	const modal = document.getElementById('modal');
	if (event.target === modal) {
		modal.style.display = 'none';
	}
});

window.addEventListener('load', function() 
{
	// wait until the page loads before working with HTML elements
	document.addEventListener('click', function(event) {

		//click listener on the document
		document.querySelectorAll('.dropdown-content').forEach(function(el) {
			if (el !== event.target) el.classList.remove('show')
			// close any showing dropdown that isn't the one just clicked
		});
		if (event.target.matches('.dropbtn')) {
			event.target.closest('.dropdown').querySelector('.dropdown-content').classList.toggle('show')
		}
		// if this is a dropdown button being clicked, toggle the show class
	})
})

// Function to convert named CSS colors to hex
function colorNameToHex(color) { return colorMap[color.toLowerCase()]||color; }

// Function to darken a hex color by a certain percentage
function darkenColor(color, percent) 
{
	const num = parseInt(color.slice(1),16);
	const amt = Math.round(2.55 * percent);

	const R = (num >> 16) -amt;
	const G = ((num >> 8) & 0x00ff) - amt;
	const B = (num & 0x0000ff) - amt;

	return `#${(
		0x1000000 +
		(R < 255 ? (R < 1 ? 0 : R) : 255) * 0x100000 +	
		(G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +	
		(B < 255 ? (B < 1 ? 0 : B) : 255))
		.toString(16)
		.slice(1)}`;
}

// Add as meany Colors as you want
const colorMap = {
	"purple": 	"#9c27b0",
	"blue": 	"#2196f3",
	"green": 	"#4caf50",
	"red": 		"#f44336",
	"orange": 	"#ff9800",
	"yellow": 	"#ffeb3b",
	"cyan": 	"#00bcd4",
	"teal": 	"#009688",
	"pink": 	"#e91e63",
	"indigo": 	"#3f51b5",
};

// Pick up optional parameters or sensible defaults
var Mode = Number(new URLSearchParams(window.location.search).get('Mode'));
var Capmodel = new URLSearchParams(window.location.search).get('Model');
var Depth = Number(new URLSearchParams(window.location.search).get('Depth'));
if (Mode === null || Mode === 0) { Mode=0; }
if (Capmodel === null) { Capmodel="CyberSecurity"; }
if (Depth === null || Depth === 0) { Depth=9; }

// Set the page title
const tdiv = document.getElementsByClassName('main-title')[0];
tdiv.innerHTML=Capmodel+" Architecture Capabilities";
	
window.addEventListener('resize', applyFullWidthClass);
document.addEventListener('DOMContentLoaded',applyFullWidthClass);

// Call the fetch function on DOMContentLoaded
if (typeof CapModel === 'undefined') {
	document.addEventListener('DOMContentLoaded', fetchCapModel);
} else {
	LoadSections();
}
