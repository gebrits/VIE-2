//automatically scans for xmlns attributes in the **html** element
//and adds them to the global VIE2.namespaces object
jQuery.each($('html').xmlns(), function (k, v) {
    var vStr = v.toString();
    if (!VIE2.namespaces.containsKey(k) && !VIE2.namespaces.containsValue(vStr)) {
        VIE2.namespaces.add(k, vStr);
    }
});

}).call(this);