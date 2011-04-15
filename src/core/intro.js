// VIE&sup2; - Vienna IKS Editable Entities
// (c) 2011 Sebastian Germesin, IKS Consortium
// VIE&sup2; may be freely distributed under the MIT license.
// (see LICENSE.txt)
// For all details and documentation:
// http://wiki.iks-project.eu/index.php/VIE^2

(function() {
// Initial setup
// -------------
//
// The VIE&sup2; library is fully contained inside a VIE2 namespace.
var VIE2 = this.VIE2 = {};
    
//VIE&sup2; is the semantic enrichment layer on top of VIE.
//Its acronym stands for <b>V</b>ienna <b>I</b>KS <b>E</b>ditable <b>E</b>ntities.

//With the help of VIE&sup2;, you can bring entites in your
//content (aka. semantic lifting) and furthermore interact
//with this knowledge in a MVC manner - using Backbone JS models
//and collections. It is important to say that VIE&sup2; helps you to
//automatically annotate data but also let's you enable users
//to change/add/remove entities and their properties at the users
//wish.
//VIE&sup2; has two main principles: 

//*  Connectors:
//   Connecting VIE&sup2; with **backend** services, that
//   can either analyse and enrich the content sent to them (e.g., using
//   Apache Stanbol or Zemanta), can act as knowledge databases (e.g., DBPedia)
//   or as serializer (e.g., RDFa).
//*  Mappings:
//   In a mapping, a web developer can specify a mapping from ontological entities
//   to backbone JS models. The developer can easily add types of entities and
//   also default attributes that are automatically filled with the help of the 
//   available connectors.
