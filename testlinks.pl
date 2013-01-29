#!/usr/bin/perl
use LWP::Simple;
use FindBin qw($Bin);
use lib "$Bin/JSON-2.53/lib/";
use JSON;
use Data::Dumper;
use strict;
use warnings;

my $url = "http://users.wpi.edu/~fcarnevale/hmn/js/objects.json";

my $json = get( $url );
die "Could not get \"$url\"\n" unless defined $json;

my $hash_ref = decode_json($json);
my %json_hash = %$hash_ref;

foreach my $key(keys %json_hash){
	print $key,"\n";
}
