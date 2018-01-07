var navigators = Array.prototype.slice.call(document.querySelectorAll('#cubeNavigation ul li'));
var cube = document.getElementById('cube');
var walls = Array.prototype.slice.call(document.querySelectorAll('#cube > div'));

var examples={
  html:`!DOCTYPE html>
        <html>
          <head>
          <style>
          div {
              border: 1px solid black;
          }
          </style>
          </head>
          <body>
            <h2 id='greeting'>Hello world</h2>
          </body>
        </html>`,
  javascript:
            ` var myBankBalance = 0;
  var output = "";
  // Do the 'for' loop
    for (myBankBalance = 0; myBankBalance <= 3; myBankBalance++) {
      if  (myBankBalance === 1) {
              continue;
      }
      output += "My bank balance is now $" + myBankBalance + "<br>";
                        }
      // Output results to the above HTML element
      document.getElementById("msg").innerHTML = output;`,
  sass:`$font-stack:    Helvetica, sans-serif;
        $primary-color: #333;

        body {
          font: 100% $font-stack;
          color: $primary-color;
          #example{
            color: $secondary-color
            &.active{
              color:$active-color
            }
          }
        }`,
  css:  `div {
        border: 1px solid black;
        margin-top: 100px;
        margin-bottom: 100px;
        margin-right: 150px;
        margin-left: 80px;
        background-color: lightblue;
        }`,
  ruby:`
        fred = [ 4, 19, 3, 7, 32 ]
        sum = 0
        fred.each { |i| sum += i }
        print "Sum of [", fred.join(" "), "] is #{sum}"
        print "The encoded message is: "
        "The secret message".each_byte do | b |
            b = b.chr.upcase
            if key.has_key?(b) then
                print key[b]
            else
                print b
            end
        end
        print ""`,
  java:`public static void badResize(int[] list, int newSize)
      	{	assert list != null && newSize >= 0 : "failed precondition";

      		int[] temp = new int[newSize];
      		int limit = Math.min(list.length, newSize);

      		for(int i = 0; i < limit; i++)
      		{	temp[i] = list[i];
      		}

      		// uh oh!! Changing pointer, not pointee. This breaks the
      		// relationship between the parameter and argument
      		list = temp;
      	}`
}

var editor = ace.edit("description");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/html");
    editor.$blockScrolling = Infinity;
    editor.setOptions({ fontSize: "16pt" });
    editor.setValue(examples.html,1);

var removeActiveAll=(elements) => {
  elements.forEach((element) => {
    element.classList.remove('active');
  })
}

var addActive=(element) => {
  element.classList.add('active');
}

navigators.forEach((navigator, index) => {
  navigator.addEventListener('click',() => {
    editor.getSession().setMode("ace/mode/" + navigator.dataset.syntax);
    editor.setValue(examples[navigator.dataset.syntax],1);
    console.log(editor);
    removeActiveAll(navigators);
    removeActiveAll(walls);
    addActive(navigator);
    walls[navigator.dataset.wall-1].classList.add('active');
  });
});
